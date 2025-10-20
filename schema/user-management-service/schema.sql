-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.conductor_profile (
  id uuid NOT NULL,
  dateofbirth character varying,
  nic_number character varying NOT NULL,
  assign_operator_id character varying NOT NULL,
  employee_id character varying NOT NULL UNIQUE,
  pr_img_path character varying,
  shift_status character varying,
  user_id uuid UNIQUE,
  CONSTRAINT conductor_profile_pkey PRIMARY KEY (id),
  CONSTRAINT fk9177s71cjet88g9qj3wd14p7s FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.finance_officer (
  id uuid NOT NULL,
  emp_id character varying,
  user_id uuid NOT NULL UNIQUE,
  CONSTRAINT finance_officer_pkey PRIMARY KEY (id),
  CONSTRAINT fkmao4a44y7sib25vlwlqnmaoaq FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.fleetoperator_profile (
  id uuid NOT NULL,
  contact_details json,
  operator_type character varying,
  organization_name character varying,
  pr_img_path character varying,
  region character varying,
  registration_id character varying,
  user_id uuid NOT NULL UNIQUE,
  CONSTRAINT fleetoperator_profile_pkey PRIMARY KEY (id),
  CONSTRAINT fkryvmp2bbqnn7phpq4f7l1h54n FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.mot (
  id uuid NOT NULL,
  assign_operator_id character varying,
  employee_id character varying,
  user_id uuid NOT NULL UNIQUE,
  CONSTRAINT mot_pkey PRIMARY KEY (id),
  CONSTRAINT fk_timekeeper_user FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.passenger_profile (
  id uuid NOT NULL,
  notification_preferences character varying,
  user_id uuid UNIQUE,
  CONSTRAINT passenger_profile_pkey PRIMARY KEY (id),
  CONSTRAINT fkt7fo39k0pyeiawmbxt6q4cipi FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.timekeepers (
  id uuid NOT NULL,
  assign_stand character varying,
  nic character varying,
  province character varying,
  user_id uuid NOT NULL UNIQUE,
  CONSTRAINT timekeepers_pkey PRIMARY KEY (id),
  CONSTRAINT fk82sax70cv26ce603799uj6fph FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

ALTER TABLE ONLY public.timekeepers
    ADD CONSTRAINT timekeepers_pkey PRIMARY KEY (id);

CREATE TABLE public.users (
  user_id uuid NOT NULL,
  account_status character varying,
  created_at timestamp with time zone,
  email character varying UNIQUE,
  full_name character varying,
  is_verified boolean,
  last_login_at timestamp with time zone,
  phone_number character varying,
  role character varying CHECK (role::text = ANY (ARRAY['Passenger'::character varying, 'Conductor'::character varying, 'FleetOperator'::character varying, 'Driver'::character varying, 'Timekeeper'::character varying, 'Admin'::character varying, 'Mot'::character varying, 'Finance_Officer'::character varying]::text[])),
  updated_at timestamp with time zone,
  username character varying UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);