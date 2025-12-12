CREATE TABLE IF NOT EXISTS "USER" (
	"USER_Id" bigint NOT NULL,
	"USER_Username" varchar(50) NOT NULL UNIQUE,
	"USER_Email" varchar(255) NOT NULL UNIQUE,
	"USER_Password" varchar(255) NOT NULL,
	"USER_Role" varchar(10) NOT NULL,
	PRIMARY KEY ("USER_Id")
);

CREATE TABLE IF NOT EXISTS "TASK" (
	"id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"assigned_by" bigint NOT NULL,
	"assigned_to" bigint NOT NULL,
	"due_date" date NOT NULL,
	"admin_feedback" varchar(255) NOT NULL,
	"TASK_Status" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "task_attachments" (
	"id" bigint NOT NULL,
	"task_id" bigint NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"created_at" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MESSAGE" (
	"MESSAGE_ID" bigint NOT NULL,
	"MESSAGE_SenderId" bigint NOT NULL,
	"MESSAGE_ReceivedId" bigint NOT NULL,
	"MESSAGE_Content" varchar(255) NOT NULL,
	PRIMARY KEY ("MESSAGE_ID")
);

CREATE TABLE IF NOT EXISTS "TASK_STATUS_HISTORY" (
	"id" bigint NOT NULL,
	"task_id" bigint NOT NULL,
	"status" bigint NOT NULL,
	"changed_at" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "STATUS" (
	"STATUS_Id" serial NOT NULL UNIQUE,
	"STATUS_Name" varchar(255) NOT NULL,
	PRIMARY KEY ("STATUS_Id")
);


ALTER TABLE "TASK" ADD CONSTRAINT "TASK_fk3" FOREIGN KEY ("assigned_by") REFERENCES "USER"("USER_Id");

ALTER TABLE "TASK" ADD CONSTRAINT "TASK_fk4" FOREIGN KEY ("assigned_to") REFERENCES "USER"("USER_Id");

ALTER TABLE "TASK" ADD CONSTRAINT "TASK_fk7" FOREIGN KEY ("TASK_Status") REFERENCES "STATUS"("STATUS_Id");
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_fk1" FOREIGN KEY ("task_id") REFERENCES "TASK"("id");
ALTER TABLE "MESSAGE" ADD CONSTRAINT "MESSAGE_fk1" FOREIGN KEY ("MESSAGE_SenderId") REFERENCES "USER"("USER_Id");

ALTER TABLE "MESSAGE" ADD CONSTRAINT "MESSAGE_fk2" FOREIGN KEY ("MESSAGE_ReceivedId") REFERENCES "USER"("USER_Id");
ALTER TABLE "TASK_STATUS_HISTORY" ADD CONSTRAINT "TASK_STATUS_HISTORY_fk2" FOREIGN KEY ("status") REFERENCES "STATUS"("STATUS_Id");
