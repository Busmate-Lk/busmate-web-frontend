'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouteWorkspace } from '@/context/RouteWorkspace/useRouteWorkspace';
import { 
  searchAllStopsExistence, 
  applyBulkSearchResultsToRouteStops,
  BulkStopExistenceSearchResult 
} from '@/services/routeWorkspaceValidation';
import { BusStopManagementService, StopRequest, RouteManagementService, RouteGroupRequest } from '@/lib/api-client/route-management';
import { 
  RouteGroup, 
  Route, 
  RouteStop, 
  Stop, 
  StopExistenceType,
  DirectionEnum,
  RoadTypeEnum
} from '@/types/RouteWorkspaceData';
import { 
  Check, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  CircleDot,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface RouteSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Submission flow states
type SubmissionStep = 'confirmation' | 'validating' | 'creating-stops' | 'building-route' | 'completed' | 'failed';

interface StepStatus {
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  message?: string;
  details?: string[];
}

interface SubmissionState {
  currentStep: SubmissionStep;
  steps: {
    validation: StepStatus;
    stopCreation: StepStatus;
    routeBuilding: StepStatus;
  };
  validationResults?: BulkStopExistenceSearchResult;
  stopsToCreate: Stop[];
  createdStops: { original: Stop; created: Stop }[];
  failedStops: { stop: Stop; error: string }[];
  finalRouteGroup?: any; // The final route group request object
  error?: string;
  createdRouteGroupId?: string;
}

const initialState: SubmissionState = {
  currentStep: 'confirmation',
  steps: {
    validation: { status: 'pending' },
    stopCreation: { status: 'pending' },
    routeBuilding: { status: 'pending' },
  },
  stopsToCreate: [],
  createdStops: [],
  failedStops: [],
};

export default function RouteSubmissionModal({ isOpen, onClose }: RouteSubmissionModalProps) {
  const { data, updateRoute } = useRouteWorkspace();
  const [state, setState] = useState<SubmissionState>(initialState);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setState(initialState);
      setProgress({ current: 0, total: 0, label: '' });
    }
  }, [isOpen]);

  // Step 1: Validate all stops existence
  // Returns the list of stops that need to be created
  const validateStops = useCallback(async (): Promise<{ success: boolean; stopsToCreate: Stop[] }> => {
    setState(prev => ({
      ...prev,
      currentStep: 'validating',
      steps: {
        ...prev.steps,
        validation: { status: 'in-progress', message: 'Validating stop existence...' }
      }
    }));

    try {
      const allRouteStops: { routeIndex: number; routeStop: RouteStop }[] = [];
      
      // Gather all route stops from all routes
      data.routeGroup.routes.forEach((route, routeIndex) => {
        route.routeStops.forEach(routeStop => {
          allRouteStops.push({ routeIndex, routeStop });
        });
      });

      if (allRouteStops.length === 0) {
        setState(prev => ({
          ...prev,
          steps: {
            ...prev.steps,
            validation: { 
              status: 'failed', 
              message: 'No stops to validate',
              details: ['Please add at least one stop to each route before submitting.']
            }
          },
          currentStep: 'failed',
          error: 'No stops found in any route'
        }));
        return { success: false, stopsToCreate: [] };
      }

      // Validate stops for each route
      const stopsToCreate: Stop[] = [];
      const existingStops: Stop[] = [];
      const validationDetails: string[] = [];

      for (let routeIndex = 0; routeIndex < data.routeGroup.routes.length; routeIndex++) {
        const route = data.routeGroup.routes[routeIndex];
        const routeStops = route.routeStops;

        if (routeStops.length === 0) {
          validationDetails.push(`Route "${route.name}" has no stops`);
          continue;
        }

        setProgress({
          current: routeIndex + 1,
          total: data.routeGroup.routes.length,
          label: `Validating route: ${route.name}`
        });

        // Search for all stops existence
        const results = await searchAllStopsExistence(
          routeStops,
          (current, total, stopName) => {
            setProgress({
              current,
              total,
              label: `Checking: ${stopName}`
            });
          }
        );

        // Update route stops with validation results
        const updatedRouteStops = applyBulkSearchResultsToRouteStops(routeStops, results);
        updateRoute(routeIndex, { routeStops: updatedRouteStops });

        // Categorize stops
        results.results.forEach(result => {
          if (result.result.found && result.result.stop) {
            existingStops.push(result.result.stop);
          } else if (!result.result.error) {
            // Stop not found and no error - needs to be created
            // Use the updated stop from the applied results
            const stopToCreate = updatedRouteStops.find(
              rs => rs.orderNumber === result.orderNumber
            )?.stop;
            if (stopToCreate && stopToCreate.name) {
              // Make a copy of the stop with the route context for later updating
              stopsToCreate.push({ ...stopToCreate });
            }
          }
        });

        validationDetails.push(
          `Route "${route.name}": ${results.successCount} existing, ${results.notFoundCount} new, ${results.errorCount} errors`
        );
      }

      console.log('Validation complete. Stops to create:', stopsToCreate);

      setState(prev => ({
        ...prev,
        validationResults: undefined, // We aggregated results
        stopsToCreate,
        steps: {
          ...prev.steps,
          validation: { 
            status: 'completed', 
            message: `Validation complete`,
            details: [
              `Found ${existingStops.length} existing stops`,
              `${stopsToCreate.length} new stops need to be created`,
              ...validationDetails
            ]
          }
        }
      }));

      return { success: true, stopsToCreate };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        steps: {
          ...prev.steps,
          validation: { 
            status: 'failed', 
            message: 'Validation failed',
            details: [error.message || 'Unknown error occurred']
          }
        },
        currentStep: 'failed',
        error: error.message || 'Validation failed'
      }));
      return { success: false, stopsToCreate: [] };
    }
  }, [data.routeGroup.routes, updateRoute]);

  // Step 2: Create new stops
  // Now accepts stopsToCreate directly instead of reading from state
  // Returns the created stops mapping for use by buildRouteGroup
  const createNewStops = useCallback(async (stopsToCreate: Stop[]): Promise<{ success: boolean; createdStops: { original: Stop; created: Stop }[] }> => {
    console.log("Creating new stops...", stopsToCreate);

    if (stopsToCreate.length === 0) {
      setState(prev => ({
        ...prev,
        currentStep: 'building-route',
        steps: {
          ...prev.steps,
          stopCreation: { 
            status: 'skipped', 
            message: 'No new stops to create',
            details: ['All stops already exist in the system']
          }
        }
      }));
      console.log("No new stops to create.");
      return { success: true, createdStops: [] };
    }

    setState(prev => ({
      ...prev,
      currentStep: 'creating-stops',
      steps: {
        ...prev.steps,
        stopCreation: { 
          status: 'in-progress', 
          message: `Creating ${stopsToCreate.length} new stops...`
        }
      }
    }));

    console.log("Stops to create:", stopsToCreate);
    const createdStops: { original: Stop; created: Stop }[] = [];
    const failedStops: { stop: Stop; error: string }[] = [];

    for (let i = 0; i < stopsToCreate.length; i++) {
      const stop = stopsToCreate[i];
      
      setProgress({
        current: i + 1,
        total: stopsToCreate.length,
        label: `Creating: ${stop.name}`
      });

      try {
        // Validate required fields
        if (!stop.name || stop.name.trim() === '') {
          failedStops.push({ stop, error: 'Stop name is required' });
          continue;
        }

        if (!stop.location || stop.location.latitude === 0 || stop.location.longitude === 0) {
          failedStops.push({ stop, error: 'Valid coordinates are required' });
          continue;
        }

        // Prepare stop request
        const stopRequest: StopRequest = {
          name: stop.name,
          nameSinhala: stop.nameSinhala,
          nameTamil: stop.nameTamil,
          description: stop.description,
          location: {
            latitude: stop.location.latitude,
            longitude: stop.location.longitude,
            address: stop.location.address,
            city: stop.location.city,
            state: stop.location.state,
            zipCode: stop.location.zipCode,
            country: stop.location.country,
            addressSinhala: stop.location.addressSinhala,
            citySinhala: stop.location.citySinhala,
            stateSinhala: stop.location.stateSinhala,
            countrySinhala: stop.location.countrySinhala,
            addressTamil: stop.location.addressTamil,
            cityTamil: stop.location.cityTamil,
            stateTamil: stop.location.stateTamil,
            countryTamil: stop.location.countryTamil,
          },
          isAccessible: stop.isAccessible
        };

        // Create the stop
        const createdStop = await BusStopManagementService.createStop(stopRequest);

        const mappedCreatedStop: Stop = {
          id: createdStop.id ?? '',
          name: createdStop.name ?? '',
          nameSinhala: createdStop.nameSinhala,
          nameTamil: createdStop.nameTamil,
          description: createdStop.description,
          location: {
            latitude: createdStop.location?.latitude ?? 0,
            longitude: createdStop.location?.longitude ?? 0,
            address: createdStop.location?.address,
            city: createdStop.location?.city,
            state: createdStop.location?.state,
            zipCode: createdStop.location?.zipCode,
            country: createdStop.location?.country,
            addressSinhala: createdStop.location?.addressSinhala,
            citySinhala: createdStop.location?.citySinhala,
            stateSinhala: createdStop.location?.stateSinhala,
            countrySinhala: createdStop.location?.countrySinhala,
            addressTamil: createdStop.location?.addressTamil,
            cityTamil: createdStop.location?.cityTamil,
            stateTamil: createdStop.location?.stateTamil,
            countryTamil: createdStop.location?.countryTamil,
          },
          isAccessible: createdStop.isAccessible,
          type: StopExistenceType.EXISTING
        };

        createdStops.push({ original: stop, created: mappedCreatedStop });

        // Update the stop in context (find by name since original has no ID)
        data.routeGroup.routes.forEach((route, routeIndex) => {
          route.routeStops.forEach((routeStop, stopIndex) => {
            if (routeStop.stop.name === stop.name && 
                routeStop.stop.type === StopExistenceType.NEW) {
              updateRoute(routeIndex, {
                routeStops: route.routeStops.map((rs, idx) => 
                  idx === stopIndex 
                    ? { ...rs, stop: mappedCreatedStop }
                    : rs
                )
              });
            }
          });
        });

        // Small delay between creations
        if (i < stopsToCreate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error: any) {
        const errorMessage = error.body?.message || error.message || 'Failed to create stop';
        failedStops.push({ stop, error: errorMessage });
      }
    }

    setState(prev => ({
      ...prev,
      createdStops,
      failedStops,
      steps: {
        ...prev.steps,
        stopCreation: { 
          status: failedStops.length === 0 ? 'completed' : 'failed',
          message: failedStops.length === 0 
            ? `Successfully created ${createdStops.length} stops`
            : `Created ${createdStops.length} stops, ${failedStops.length} failed`,
          details: [
            ...createdStops.map(s => `✓ Created: ${s.created.name} (ID: ${s.created.id})`),
            ...failedStops.map(s => `✗ Failed: ${s.stop.name} - ${s.error}`)
          ]
        }
      }
    }));

    if (failedStops.length > 0) {
      setState(prev => ({
        ...prev,
        currentStep: 'failed',
        error: `Failed to create ${failedStops.length} stops. Route group cannot be submitted with missing stops.`
      }));
      return { success: false, createdStops };
    }

    return { success: true, createdStops };
  }, [data.routeGroup.routes, updateRoute]);

  // Step 3: Build final route group object
  // Now accepts createdStops mapping to look up IDs for newly created stops
  // This avoids relying on async React state updates
  const buildRouteGroup = useCallback(async (createdStopsMapping: { original: Stop; created: Stop }[]) => {
    setState(prev => ({
      ...prev,
      currentStep: 'building-route',
      steps: {
        ...prev.steps,
        routeBuilding: { 
          status: 'in-progress', 
          message: 'Building route group...'
        }
      }
    }));

    setProgress({
      current: 1,
      total: 2,
      label: 'Preparing route group data...'
    });

    try {
      // Get data from context
      const routeGroup = data.routeGroup;
      
      // Create a map of original stop names to their created IDs
      // This is used to look up IDs for newly created stops since React state updates are async
      const createdStopIdMap = new Map<string, string>();
      createdStopsMapping.forEach(({ original, created }) => {
        if (original.name && created.id) {
          createdStopIdMap.set(original.name, created.id);
        }
      });

      console.log('Created stops ID mapping:', Object.fromEntries(createdStopIdMap));

      // Helper function to get stop ID - checks created mapping first, then existing ID
      const getStopId = (stop: Stop): string => {
        // First check if this stop was just created (use the mapping)
        if (stop.name && createdStopIdMap.has(stop.name)) {
          return createdStopIdMap.get(stop.name)!;
        }
        // Otherwise use the existing ID
        return stop.id || '';
      };
      
      // Validate all stops have IDs (either existing or from created mapping)
      const stopsWithoutIds: string[] = [];
      routeGroup.routes.forEach(route => {
        route.routeStops.forEach(routeStop => {
          const stopId = getStopId(routeStop.stop);
          if (!stopId || stopId.trim() === '') {
            stopsWithoutIds.push(routeStop.stop.name || `Order ${routeStop.orderNumber}`);
          }
        });
      });

      if (stopsWithoutIds.length > 0) {
        setState(prev => ({
          ...prev,
          steps: {
            ...prev.steps,
            routeBuilding: { 
              status: 'failed',
              message: 'Cannot build route group - some stops are missing IDs',
              details: stopsWithoutIds.map(name => `Missing ID: ${name}`)
            }
          },
          currentStep: 'failed',
          error: 'Some stops do not have valid IDs in the system'
        }));
        return false;
      }

      // Build the route group request object using the helper to get correct IDs
      const routeGroupRequest: RouteGroupRequest = {
        name: routeGroup.name,
        nameSinhala: routeGroup.nameSinhala,
        nameTamil: routeGroup.nameTamil,
        description: routeGroup.description,
        routes: routeGroup.routes.map(route => {
          const routeStopsWithIds = route.routeStops.map((routeStop, index) => ({
            stopId: getStopId(routeStop.stop),
            stopOrder: index,
            distanceFromStartKm: routeStop.distanceFromStart
          }));

          return {
            name: route.name,
            nameSinhala: route.nameSinhala,
            nameTamil: route.nameTamil,
            routeNumber: route.routeNumber,
            description: route.description,
            roadType: route.roadType,
            routeThrough: route.routeThrough,
            routeThroughSinhala: route.routeThroughSinhala,
            routeThroughTamil: route.routeThroughTamil,
            startStopId: routeStopsWithIds[0]?.stopId || '',
            endStopId: routeStopsWithIds[routeStopsWithIds.length - 1]?.stopId || '',
            distanceKm: route.distanceKm,
            estimatedDurationMinutes: route.estimatedDurationMinutes,
            direction: route.direction,
            routeStops: routeStopsWithIds
          };
        })
      };

      // Console log the final route group object
      console.log('='.repeat(80));
      console.log('ROUTE GROUP SUBMISSION - Final Request Object');
      console.log('='.repeat(80));
      console.log(JSON.stringify(routeGroupRequest, null, 2));
      console.log('='.repeat(80));

      setProgress({
        current: 2,
        total: 2,
        label: 'Submitting route group to server...'
      });

      // Call the API to create the route group
      const createdRouteGroup = await RouteManagementService.createRouteGroup(routeGroupRequest);

      console.log('Route group created successfully:', createdRouteGroup);

      setState(prev => ({
        ...prev,
        finalRouteGroup: routeGroupRequest,
        steps: {
          ...prev.steps,
          routeBuilding: { 
            status: 'completed',
            message: 'Route group created successfully',
            details: [
              `Route Group: ${routeGroup.name}`,
              `Route Group ID: ${createdRouteGroup.id}`,
              `Routes: ${routeGroup.routes.length}`,
              `Total Stops: ${routeGroup.routes.reduce((acc, r) => acc + r.routeStops.length, 0)}`
            ]
          }
        },
        currentStep: 'completed',
        createdRouteGroupId: createdRouteGroup.id
      }));

      return true;
    } catch (error: any) {
      const errorMessage = error.body?.message || error.message || 'Failed to create route group';
      console.error('Failed to create route group:', error);
      
      setState(prev => ({
        ...prev,
        steps: {
          ...prev.steps,
          routeBuilding: { 
            status: 'failed',
            message: 'Failed to create route group',
            details: [errorMessage]
          }
        },
        currentStep: 'failed',
        error: errorMessage
      }));
      return false;
    }
  }, [data.routeGroup]);

  // Main submission flow
  const handleProceed = useCallback(async () => {
    // Step 1: Validation - returns the stops that need to be created
    console.log("Step 1: Starting validation...");
    const validationResult = await validateStops();
    console.log("Step 1 complete. Success:", validationResult.success, "Stops to create:", validationResult.stopsToCreate.length);
    
    if (!validationResult.success) return;

    // Step 2: Create stops - pass the stops directly and get the created mapping back
    console.log("Step 2: Creating new stops...");
    const creationResult = await createNewStops(validationResult.stopsToCreate);
    console.log("Step 2 complete. Success:", creationResult.success, "Created stops:", creationResult.createdStops.length);
    
    if (!creationResult.success) return;

    // Step 3: Build route group - pass the created stops mapping to avoid async state issues
    console.log("Step 3: Building route group...");
    await buildRouteGroup(creationResult.createdStops);
    console.log("Step 3 complete.");
  }, [validateStops, createNewStops, buildRouteGroup]);

  const handleClose = () => {
    setState(initialState);
    onClose();
  };

  const handleViewRouteGroup = () => {
    // For now, just log since API is not implemented
    console.log('Navigate to route group page (API not implemented yet)');
    handleClose();
  };

  // Render step indicator
  const renderStepIndicator = (step: StepStatus, label: string, stepNumber: number) => {
    const getIcon = () => {
      switch (step.status) {
        case 'completed':
          return <CheckCircle2 className="w-6 h-6 text-green-600" />;
        case 'failed':
          return <X className="w-6 h-6 text-red-600" />;
        case 'in-progress':
          return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
        case 'skipped':
          return <Check className="w-6 h-6 text-gray-400" />;
        default:
          return <CircleDot className="w-6 h-6 text-gray-300" />;
      }
    };

    const getStatusColor = () => {
      switch (step.status) {
        case 'completed':
          return 'border-green-600 bg-green-50';
        case 'failed':
          return 'border-red-600 bg-red-50';
        case 'in-progress':
          return 'border-blue-600 bg-blue-50';
        case 'skipped':
          return 'border-gray-300 bg-gray-50';
        default:
          return 'border-gray-200 bg-white';
      }
    };

    return (
      <div className={`p-4 rounded-lg border-2 ${getStatusColor()} transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Step {stepNumber}:</span>
              <span className="font-semibold text-gray-900">{label}</span>
            </div>
            {step.message && (
              <p className="text-sm text-gray-600 mt-1">{step.message}</p>
            )}
          </div>
        </div>
        {step.details && step.details.length > 0 && (
          <div className="mt-3 ml-9 space-y-1">
            {step.details.map((detail, idx) => (
              <p key={idx} className="text-xs text-gray-500">{detail}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render progress bar
  const renderProgressBar = () => {
    if (progress.total === 0) return null;

    const percentage = Math.round((progress.current / progress.total) * 100);

    return (
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{progress.label}</span>
          <span>{progress.current} / {progress.total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Render confirmation view
  const renderConfirmation = () => (
    <>
      <DialogHeader>
        <DialogTitle>Submit Route Group</DialogTitle>
        <DialogDescription>
          Are you sure you want to submit this route group?
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="font-medium text-gray-900">{data.routeGroup.name || 'Unnamed Route Group'}</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Routes: {data.routeGroup.routes.length}</p>
            <p>Total Stops: {data.routeGroup.routes.reduce((acc, r) => acc + r.routeStops.length, 0)}</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Submission Process:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Validate all stop existence in the system</li>
                <li>Create any new stops that don't exist</li>
                <li>Build and submit the route group</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleProceed}>
          <ArrowRight className="w-4 h-4 mr-2" />
          Proceed
        </Button>
      </DialogFooter>
    </>
  );

  // Render processing view
  const renderProcessing = () => (
    <>
      <DialogHeader>
        <DialogTitle>Submitting Route Group</DialogTitle>
        <DialogDescription>
          Please wait while we process your submission...
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-4">
        {renderStepIndicator(state.steps.validation, 'Stop Validation', 1)}
        {renderStepIndicator(state.steps.stopCreation, 'Create New Stops', 2)}
        {renderStepIndicator(state.steps.routeBuilding, 'Build Route Group', 3)}
        
        {renderProgressBar()}
      </div>
    </>
  );

  // Render completed view
  const renderCompleted = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="w-6 h-6" />
          Submission Complete
        </DialogTitle>
        <DialogDescription>
          Your route group has been prepared successfully.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="font-medium text-green-800">Summary</div>
          <div className="text-sm text-green-700 space-y-2">
            <p><strong>Route Group:</strong> {data.routeGroup.name}</p>
            <p><strong>Routes:</strong> {data.routeGroup.routes.length}</p>
            <p><strong>Total Stops:</strong> {data.routeGroup.routes.reduce((acc, r) => acc + r.routeStops.length, 0)}</p>
            {state.createdStops.length > 0 && (
              <p><strong>New Stops Created:</strong> {state.createdStops.length}</p>
            )}
          </div>
        </div>

        {state.createdRouteGroupId && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Route Group Created</p>
                <p>ID: {state.createdRouteGroupId}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {renderStepIndicator(state.steps.validation, 'Stop Validation', 1)}
          {renderStepIndicator(state.steps.stopCreation, 'Create New Stops', 2)}
          {renderStepIndicator(state.steps.routeBuilding, 'Build Route Group', 3)}
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button 
          variant="outline" 
          onClick={handleViewRouteGroup} 
          disabled={!state.createdRouteGroupId}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Route Group
        </Button>
        <Button onClick={handleClose}>
          Finish
        </Button>
      </DialogFooter>
    </>
  );

  // Render failed view
  const renderFailed = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-700">
          <X className="w-6 h-6" />
          Submission Failed
        </DialogTitle>
        <DialogDescription>
          There was an error during the submission process.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{state.error}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {renderStepIndicator(state.steps.validation, 'Stop Validation', 1)}
          {renderStepIndicator(state.steps.stopCreation, 'Create New Stops', 2)}
          {renderStepIndicator(state.steps.routeBuilding, 'Build Route Group', 3)}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );

  // Determine which view to render
  const renderContent = () => {
    switch (state.currentStep) {
      case 'confirmation':
        return renderConfirmation();
      case 'validating':
      case 'creating-stops':
      case 'building-route':
        return renderProcessing();
      case 'completed':
        return renderCompleted();
      case 'failed':
        return renderFailed();
      default:
        return renderConfirmation();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
