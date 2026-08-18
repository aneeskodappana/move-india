CREATE TYPE "public"."collection_status" AS ENUM('scheduled', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."grievance_status" AS ENUM('open', 'under_review', 'closed');--> statement-breakpoint
CREATE TYPE "public"."handover_status" AS ENUM('kept_out', 'collected', 'missed', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."occupant_role" AS ENUM('owner', 'tenant');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('paid', 'pending');--> statement-breakpoint
CREATE TABLE "collection_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"event_date" date NOT NULL,
	"material_type" varchar(100) NOT NULL,
	"time_window" varchar(80) NOT NULL,
	"status" "collection_status" DEFAULT 'scheduled' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grievances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occupant_id" uuid NOT NULL,
	"handover_log_id" uuid NOT NULL,
	"description" text NOT NULL,
	"status" "grievance_status" DEFAULT 'open' NOT NULL,
	"filed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "handover_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occupant_id" uuid NOT NULL,
	"collection_event_id" uuid NOT NULL,
	"resident_marked_at" timestamp with time zone NOT NULL,
	"collector_marked_at" timestamp with time zone,
	"photo_url" text,
	"status" "handover_status" DEFAULT 'kept_out' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occupants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"phone" varchar(24) NOT NULL,
	"role" "occupant_role" NOT NULL,
	"move_in_date" date NOT NULL,
	"move_out_date" date
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occupant_id" uuid NOT NULL,
	"month" varchar(7) NOT NULL,
	"amount_inr" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"receipt_id" varchar(40) NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address_line" varchar(255) NOT NULL,
	"ward" varchar(100) NOT NULL,
	"mock_qr_id" varchar(32) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"route_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ward" varchar(100) NOT NULL,
	"name" varchar(120) NOT NULL,
	"weekly_material_calendar" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collection_events" ADD CONSTRAINT "collection_events_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_events" ADD CONSTRAINT "collection_events_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_occupant_id_occupants_id_fk" FOREIGN KEY ("occupant_id") REFERENCES "public"."occupants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_handover_log_id_handover_logs_id_fk" FOREIGN KEY ("handover_log_id") REFERENCES "public"."handover_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handover_logs" ADD CONSTRAINT "handover_logs_occupant_id_occupants_id_fk" FOREIGN KEY ("occupant_id") REFERENCES "public"."occupants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handover_logs" ADD CONSTRAINT "handover_logs_collection_event_id_collection_events_id_fk" FOREIGN KEY ("collection_event_id") REFERENCES "public"."collection_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occupants" ADD CONSTRAINT "occupants_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_occupant_id_occupants_id_fk" FOREIGN KEY ("occupant_id") REFERENCES "public"."occupants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "collection_events_property_date_idx" ON "collection_events" USING btree ("property_id","event_date");--> statement-breakpoint
CREATE INDEX "collection_events_route_date_idx" ON "collection_events" USING btree ("route_id","event_date");--> statement-breakpoint
CREATE INDEX "grievances_occupant_id_idx" ON "grievances" USING btree ("occupant_id");--> statement-breakpoint
CREATE INDEX "grievances_handover_log_id_idx" ON "grievances" USING btree ("handover_log_id");--> statement-breakpoint
CREATE UNIQUE INDEX "handover_logs_occupant_event_idx" ON "handover_logs" USING btree ("occupant_id","collection_event_id");--> statement-breakpoint
CREATE INDEX "handover_logs_collection_event_id_idx" ON "handover_logs" USING btree ("collection_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "occupants_phone_idx" ON "occupants" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "occupants_property_id_idx" ON "occupants" USING btree ("property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_occupant_month_idx" ON "payments" USING btree ("occupant_id","month");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_receipt_id_idx" ON "payments" USING btree ("receipt_id");--> statement-breakpoint
CREATE UNIQUE INDEX "properties_mock_qr_id_idx" ON "properties" USING btree ("mock_qr_id");--> statement-breakpoint
CREATE INDEX "properties_route_id_idx" ON "properties" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "properties_ward_idx" ON "properties" USING btree ("ward");--> statement-breakpoint
CREATE UNIQUE INDEX "routes_name_idx" ON "routes" USING btree ("name");