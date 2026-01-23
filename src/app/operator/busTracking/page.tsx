// "use client"

// import { useEffect, useState } from "react"
// import { Sidebar } from "@/components/operator/sidebar"
// import { Header } from "@/components/operator/header"
// import { PageHeader } from "@/components/operator/page-header"
// import { BusCard } from "@/components/operator/bus-card"
// import { Tabs } from "@/components/operator/tabs"
// import Link from "next/link"
// import {BusData} from "@/types/responsedto/busDetails-by-operator"
// import { getBusDetailsByOperator } from "@/lib/api/route-management/busDetailsByOperator"
// import { useAuth } from "@/context/AuthContext"



// export default function FleetManagement() {
//   const [activeTab, setActiveTab] = useState("all")
//   const [data, setData] = useState<BusData[] | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const { user } = useAuth();
//   const operatorId = user?.id;

//   useEffect(() => {
//     setLoading(true);
//     getBusDetailsByOperator({ 
//       operatorId: operatorId
//      })
//       .then((res) => {
//         setData(res);
//         setError(null);
//       })
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, [operatorId]);

//   const busesData: BusData[] = [
//     {
//       id: "1",
//       busNumber: "ND 4536",
//       busName: "Mandakini Express",
//       route: "MATARA-GALLE",
//       driver: "Kasun Perera",
//       conductor: "Nuwan Silva",
//       conductorPhone: "+94 77 234 5678",
//       status: "Active",
//     },
//     {
//       id: "2",
//       busNumber: "ND 7892",
//       busName: "Mandakini Super",
//       route: "MATARA-COLOMBO",
//       driver: "Chaminda Fernando",
//       conductor: "Roshan Jayawardena",
//       conductorPhone: "+94 77 456 7890",
//       status: "Active",
//     },
//     {
//       id: "3",
//       busNumber: "ND 3421",
//       busName: "Mandakini Classic",
//       route: "MATARA-TANGALLE",
//       driver: "Pradeep Kumara",
//       conductor: "Mahinda Rathnayake",
//       conductorPhone: "+94 77 678 9012",
//       status: "Active",
//     },
//     {
//       id: "4",
//       busNumber: "ND 8765",
//       busName: "Mandakini Deluxe",
//       route: "MATARA-HAMBANTOTA",
//       driver: "Dinesh Bandara",
//       conductor: "Sampath Wijesinghe",
//       conductorPhone: "+94 77 890 1234",
//       status: "Active",
//     },
//     {
//       id: "5",
//       busNumber: "ND 5234",
//       busName: "Mandakini Premium",
//       route: "MATARA-AKURESSA",
//       driver: "Thilaka Dissanayake",
//       conductor: "Ruwan Gunawardena",
//       conductorPhone: "+94 77 012 3456",
//       status: "Maintenance",
//     },
//     {
//       id: "6",
//       busNumber: "ND 9876",
//       busName: "Mandakini Royal",
//       route: "MATARA-WELIGAMA",
//       driver: "Sunil Rajapaksha",
//       conductor: "Chandana Senanayake",
//       conductorPhone: "+94 77 234 5678",
//       status: "Active",
//     },
//     {
//       id: "7",
//       busNumber: "ND 2468",
//       busName: "Mandakini Highway",
//       route: "MATARA-KATARAGAMA",
//       driver: "Upul Mendis",
//       conductor: "Gamini Wickramasinghe",
//       conductorPhone: "+94 77 456 7890",
//       status: "Maintenance",
//     },
//   ]

//   const getFilteredBuses = (filter: string) => {
//     if (filter === "all") return busesData
//     return busesData.filter((bus) => bus.status.toLowerCase() === filter.toLowerCase())
//   }

//   // const handleAddBus = () => {
//   //   console.log("Add new bus")
//   // }

//   const tabs = [
//     {
//       value: "all",
//       label: "All Buses",
//       content: (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {getFilteredBuses("all").map((bus) => (
//             <BusCard
//               key={bus.id}
//               busNumber={bus.busNumber}
//               busName={bus.busName}
//               route={bus.route}
//               driver={bus.driver}
//               conductor={bus.conductor}
//               conductorPhone={bus.conductorPhone}
//               status={bus.status}
//             />
//           ))}
//         </div>
//       ),
//     },
//     {
//       value: "active",
//       label: "Active",
//       content: (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {getFilteredBuses("active").map((bus) => (
//             <BusCard
//               key={bus.id}
//               busNumber={bus.busNumber}
//               busName={bus.busName}
//               route={bus.route}
//               driver={bus.driver}
//               conductor={bus.conductor}
//               conductorPhone={bus.conductorPhone}
//               status={bus.status}
//             />
//           ))}
//         </div>
//       ),
//     },
//     {
//       value: "maintenance",
//       label: "Maintenance",
//       content: (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {getFilteredBuses("maintenance").map((bus) => (
//             <BusCard
//               key={bus.id}
//               busNumber={bus.busNumber}
//               busName={bus.busName}
//               route={bus.route}
//               driver={bus.driver}
//               conductor={bus.conductor}
//               conductorPhone={bus.conductorPhone}
//               status={bus.status}
//             />
//           ))}
//         </div>
//       ),
//     },
//     {
//       value: "inactive",
//       label: "Inactive",
//       content: (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {getFilteredBuses("inactive").map((bus) => (
//             <BusCard
//               key={bus.id}
//               busNumber={bus.busNumber}
//               busName={bus.busName}
//               route={bus.route}
//               driver={bus.driver}
//               conductor={bus.conductor}
//               conductorPhone={bus.conductorPhone}
//               status={bus.status}
//             />
//           ))}
//         </div>
//       ),
//     },
//   ]

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* <Sidebar activeItem="tracking" /> */}

//       <div className="flex-1">
//         <Header 
//           pageTitle="Bus Tracking" 
//           pageDescription="Real-time tracking and monitoring of your fleet vehicles"
//         />

//         <div className="p-6">

//           <Tabs tabs={tabs} defaultValue="all" onValueChange={setActiveTab} />
//         </div>
//       </div>
//     </div>
//   )
// }
