using FluentMigrator;

namespace Joy.PIM.Migrator.Migration;
[Migration(20220927)]
public class Version20220927 : FluentMigrator.Migration
{
    public override void Up()
    {
        this.CreateMasterTable("MetricType");
        this.CreateMasterTable("LocationType");
        this.CreateMasterTable("Standards");
        this.CreateMasterTable("ESGRCType");
        this.CreateMasterTable("UOM");
        this.CreateMasterTable("Category");
        this.CreateMasterTable("Industry");
        this.CreateMasterTable("UploadedFileStatus");
        this.CreateMasterTable("Quatter");
        this.CreateMasterTable("Months");
        this.CreateMasterTable("ValidationList");
        this.CreateMasterTable("Process");
        this.CreateMasterTable("StageAction");
        this.CreateMasterTable("Compliance");
        this.CreateMasterTable("Department");
        this.CreateMasterTable("TemplateStatus");
        this.CreateMasterTable("Service");
        this.CreateMasterTable("TimeDimension");
        this.CreateMasterTable("FormulaStandards");
        this.CreateMasterTable("DataviewDimensions");
        this.CreateMasterTable("Organizations");
        this.CreateMasterTable("Currency");
        this.CreateMasterTable("BusinessUnits");
        this.CreateMasterTable("Facility");
        this.CreateMasterTable("WeeksMaster");
        this.CreateMasterTable("GHGMaster");

        this.CreateMasterTable("TableMetadata");
        this.CreateMasterTable("TaskStepInstanceStatus");
        this.CreateMasterTable("MetricsPrefix");
        this.CreateTableAndAddStandardColumns("WorkflowDesign");
        this.CreateColIfNotExists("WorkflowDesign", "Process", col => col.AsString().NotNullable());
        this.CreateColIfNotExists("WorkflowDesign", "Description", col => col.AsString().NotNullable());
        this.CreateForeignKeyColIfNotExists("WorkflowDesign", "TableMetadataId", "TableMetadata");
        this.CreateColIfNotExists("WorkflowDesign", "Trigger", col => col.AsString().NotNullable());
        this.CreateJsonBColIfNotExists("WorkflowDesign", "ConfigJson");

        this.CreateTableAndAddStandardColumns("WorkflowRun");
        this.CreateColIfNotExists("WorkflowRun", "Process", col => col.AsString().NotNullable());
        this.CreateColIfNotExists("WorkflowRun", "Description", col => col.AsString().NotNullable());
        this.CreateForeignKeyColIfNotExists("WorkflowRun", "TableMetadataId", "TableMetadata");
        this.CreateColIfNotExists("WorkflowRun", "Trigger", col => col.AsString().NotNullable());
        this.CreateColIfNotExists("WorkflowRun", "RecordId", col => col.AsInt64().NotNullable());
        this.CreateJsonBColIfNotExists("WorkflowRun", "ConfigJson");

        this.CreateTableAndAddStandardColumns("TaskStep");
        this.CreateColIfNotExists("TaskStep", "Name", col => col.AsString().NotNullable());
        this.CreateColIfNotExists("TaskStep", "TableName", col => col.AsString().Nullable());
        this.CreateColIfNotExists("TaskStep", "Sequence", col => col.AsInt64().NotNullable());
        this.CreateColIfNotExists("TaskStep", "IsParallel", col => col.AsBoolean().NotNullable().WithDefaultValue(false));
        this.CreateForeignKeyColIfNotExists("TaskStep", "NextStepId", "TaskStep");
        this.CreateColIfNotExists("TaskStep", "IsFinalStep", col => col.AsBoolean().NotNullable().WithDefaultValue(false));
        this.CreateForeignKeyColIfNotExists("TaskStep", "OwnerId", "AppUser");
        this.CreateColIfNotExists("TaskStep", "IsAll", col => col.AsBoolean().NotNullable().WithDefaultValue(false));
        this.CreateForeignKeyColIfNotExists("TaskStep", "WorkflowDesignId", "WorkflowDesign");
        this.CreateForeignKeyColIfNotExists("TaskStep", "RejectedStageId", "TaskStep");

        this.CreateTableAndAddStandardColumns("TaskStepInstance");
        this.CreateColIfNotExists("TaskStepInstance", "Name", col => col.AsString().NotNullable());
        this.CreateColIfNotExists("TaskStepInstance", "TableName", col => col.AsString().Nullable());
        this.CreateColIfNotExists("TaskStepInstance", "Sequence", col => col.AsInt64().NotNullable());
        this.CreateColIfNotExists("TaskStepInstance", "IsParallel", col => col.AsBoolean().NotNullable().WithDefaultValue(false)); 
        this.CreateForeignKeyColIfNotExists("TaskStepInstance", "NextStepId", "TaskStepInstance");
        this.CreateColIfNotExists("TaskStepInstance", "IsFinalStep", col => col.AsBoolean().NotNullable().WithDefaultValue(false));
        this.CreateForeignKeyColIfNotExists("TaskStepInstance", "OwnerId", "AppUser");
        this.CreateColIfNotExists("TaskStepInstance", "IsAll", col => col.AsBoolean().NotNullable().WithDefaultValue(false));
        this.CreateForeignKeyColIfNotExists("TaskStepInstance", "WorkflowDesignId", "WorkflowDesign");
        this.CreateForeignKeyColIfNotExists("TaskStepInstance", "WorkflowRunId", "WorkflowRun");
        this.CreateForeignKeyColIfNotExists("TaskStepInstance", "RejectedStageId", "TaskStep");
        this.CreateForeignKeyColIfNotExists("TaskStepInstance", "TaskStepId", "TaskStep");
        this.CreateForeignKeyColIfNotExists("TaskStepInstance", "TaskStepInstanceStatusId", "TaskStepInstanceStatus");
        this.CreateColIfNotExists("TaskStepInstance", "UserComments", col => col.AsString().NotNullable());
        this.CreateColIfNotExists("TaskStepInstance", "Action", col => col.AsString().NotNullable());
        this.CreateColIfNotExists("TaskStepInstance", "Title", col => col.AsString().Nullable());

        this.CreateTableAndAddStandardColumns("RbacAccessObject", false);
        this.CreateColIfNotExists("RbacAccessObject", "GuidId", col => col.AsString().NotNullable());
        this.CreateColIfNotExists("RbacAccessObject", "AccessName", col => col.AsString().NotNullable());

        this.CreateTableAndAddStandardColumns("Metric");
        this.CreateTableAndAddStandardColumns("MetricAnswerOptions");
        this.CreateTableAndAddStandardColumns("AuditRequest");
        this.CreateTableAndAddStandardColumns("AuditStage");
        this.CreateTableAndAddStandardColumns("AuditResponse");
        this.CreateTableAndAddStandardColumns("Template");
        this.CreateTableAndAddStandardColumns("CreateAudit");
        this.CreateTableAndAddStandardColumns("Period");
        this.CreateTableAndAddStandardColumns("UploadedFileData");
        this.CreateTableAndAddStandardColumns("Assessment");
        this.CreateTableAndAddStandardColumns("Threshold");
        this.CreateTableAndAddStandardColumns("TemplateMapping");
        this.CreateTableAndAddStandardColumns("BESCOM");
        this.CreateTableAndAddStandardColumns("EmployeeDetails");
        this.CreateTableAndAddStandardColumns("BWSSB");
        this.CreateTableAndAddStandardColumns("TaskAction");
        this.CreateTableAndAddStandardColumns("MergeReport");
        this.CreateTableAndAddStandardColumns("AuditIssue");
        this.CreateTableAndAddStandardColumns("DataIngestion");
        this.CreateTableAndAddStandardColumns("CalculationProcess");
        this.CreateTableAndAddStandardColumns("MGMultiselection");
        this.CreateTableAndAddStandardColumns("BusinessHours");
        this.CreateTableAndAddStandardColumns("BusinessHoliday");
        this.CreateTableAndAddStandardColumns("APIIntegration");
        this.CreateTableAndAddStandardColumns("SLAProcess");
        this.CreateTableAndAddStandardColumns("SLAConfig");
        this.CreateTableAndAddStandardColumns("APIMetaData");
        this.CreateTableAndAddStandardColumns("ValueMaster");
        this.CreateTableAndAddStandardColumns("UploadedJson");

        this.CreateColIfNotExists("Metric", "Name", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("Metric", "GroupId", "MetricGroup");
        this.CreateColIfNotExists("Metric", "MetricsQuestion", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Metric", "Displaylabel", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("Metric", "AnswerOption", "MetricAnswerOptions");
        this.CreateForeignKeyColIfNotExists("Metric", "Standard", "Standards");
        this.CreateForeignKeyColIfNotExists("Metric", "TypeId", "MetricType");
        this.CreateColIfNotExists("Metric", "LookUpTable", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Metric", "LookUpTableColumn", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("Metric", "ESGRCType", "ESGRCType");
        this.CreateForeignKeyColIfNotExists("Metric", "UOM", "UOM");
        this.CreateForeignKeyColIfNotExists("Metric", "Category", "Category");
        this.CreateForeignKeyColIfNotExists("Metric", "Department", "Department");
        this.CreateColIfNotExists("Metric", "ValidationId", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Metric", "IsKeyIndicator", col => col.AsBoolean().NotNullable().WithDefaultValue(false));
        this.CreateColIfNotExists("Metric", "IsUnique", col => col.AsBoolean().NotNullable().WithDefaultValue(false));
        this.CreateColIfNotExists("Metric", "StandardYear", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Metric", "Target", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("Metric", "RegulationTypeId", "Type");
        this.CreateForeignKeyColIfNotExists("Metric", "ServiceId", "Service");
        this.CreateColIfNotExists("Metric", "ParentId", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("Metric", "FormulaeField", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("Metric", "TimeDimension", "TimeDimension");
        this.CreateForeignKeyColIfNotExists("Metric", "Prefix", "MetricsPrefix");
        this.CreateJsonBColIfNotExists("Metric", "MetricJson");

        this.CreateColIfNotExists("Metrictype", "CalculatedValue", col => col.AsString().Nullable());

        this.CreateForeignKeyColIfNotExists("MetricAnswerOptions", "MetricQuestionId", "Metric");
        this.CreateJsonBColIfNotExists("MetricAnswerOptions", "ResponseJson");
        this.CreateForeignKeyColIfNotExists("MetricAnswerOptions", "MetricGroupId", "MetricGroup");
        this.CreateForeignKeyColIfNotExists("MetricAnswerOptions", "TemplateId", "Template");
        this.CreateForeignKeyColIfNotExists("MetricAnswerOptions", "ProcessId", "Process");
        this.CreateColIfNotExists("MetricAnswerOptions", "Status", col => col.AsInt64().Nullable());
        this.CreateForeignKeyColIfNotExists("MetricAnswerOptions", "AuditId", "CreateAudit");
        this.CreateForeignKeyColIfNotExists("MetricAnswerOptions", "AssessmentId", "Assessment");
        this.CreateForeignKeyColIfNotExists("MetricAnswerOptions", "UploadedfileId", "UploadedFile");
        this.CreateColIfNotExists("MetricAnswerOptions", "MetricParentId", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("MetricAnswerOptions", "TotalValue", col => col.AsString().Nullable());

        this.CreateColIfNotExists("AuditRequest", "Name", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("AuditRequest", "RequestedBy", "AppUser");
        this.CreateForeignKeyColIfNotExists("AuditRequest", "AuditedBy", "AppUser");
        this.CreateForeignKeyColIfNotExists("AuditRequest", "ApprovedBy", "AppUser");
        this.CreateColIfNotExists("AuditRequest", "AuditDate", col => col.AsDateTime().Nullable());
        this.CreateForeignKeyColIfNotExists("AuditRequest", "AuditType", "AuditType");
        this.CreateForeignKeyColIfNotExists("AuditRequest", "StatusId", "StageStatus");

        this.CreateForeignKeyColIfNotExists("AuditStage", "Team", "AuditTeam");
        this.CreateForeignKeyColIfNotExists("AuditStage", "AuditRequestID", "Audit");
        this.CreateJsonBColIfNotExists("AuditStage", "StageResponse");
        this.CreateColIfNotExists("AuditStage", "DataSource", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("AuditStage", "StatusId", "StageStatus");
        this.CreateForeignKeyColIfNotExists("AuditStage", "TemplateId", "Template");

        this.CreateForeignKeyColIfNotExists("AuditResponse", "AuditId", "CreateAudit");
        this.CreateForeignKeyColIfNotExists("AuditResponse", "PeriodId", "Period");
        this.CreateJsonBColIfNotExists("AuditResponse", "AuditData");
        this.CreateJsonBColIfNotExists("AuditResponse", "StandardData");
        this.CreateJsonBColIfNotExists("AuditResponse", "TargetData");

        this.CreateColIfNotExists("Template", "Name", col => col.AsString().NotNullable());
        this.CreateForeignKeyColIfNotExists("Template", "MetricGroupId", "MetricGroup");
        this.CreateColIfNotExists("Template", "Description", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Template", "IsSFTP", col => col.AsBoolean().Nullable().WithDefaultValue(false));

        this.CreateMasterTable("Type");
        this.CreateTableAndAddStandardColumns("Geography");
        this.CreateColIfNotExists("Geography", "Name", x => x.AsString().NotNullable());
        this.CreateForeignKeyColIfNotExists("Geography", "LocationTypeId", "LocationType");
        this.CreateForeignKeyColIfNotExists("Geography", "ParentId", "Geography");

        this.CreateTableAndAddStandardColumns("Cities");
        this.CreateColIfNotExists("Cities", "Code", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("Cities", "Country", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Cities", "State", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Cities", "Zone", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Cities", "District", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Cities", "City", col => col.AsString().Nullable());

        this.CreateColIfNotExists("MetricType", "Icon", col => col.AsString().Nullable());

        this.CreateTableAndAddStandardColumns("TemplateRole");
        this.CreateForeignKeyColIfNotExists("TemplateRole", "TemplateId", "Template");
        this.CreateForeignKeyColIfNotExists("TemplateRole", "RoleId", "Role");

        this.CreateTableAndAddStandardColumns("TemplateStages");
        this.CreateForeignKeyColIfNotExists("TemplateStages", "TemplateId", "Template");
        this.CreateColIfNotExists("TemplateStages", "StageLevel", col => col.AsInt64().Nullable());
        this.CreateForeignKeyColIfNotExists("TemplateStages", "RoleId", "Role");
        this.CreateColIfNotExists("TemplateStages", "NextStageId", col => col.AsInt64().Nullable());
        this.CreateForeignKeyColIfNotExists("TemplateStages", "ActionId", "StageAction");
        this.CreateForeignKeyColIfNotExists("TemplateStages", "ApproverId", "Role");
        this.CreateForeignKeyColIfNotExists("TemplateStages", "ProcessId", "Process");
        this.CreateColIfNotExists("TemplateStages", "Status", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("TemplateStages", "IsPublish", col => col.AsBoolean().NotNullable().WithDefaultValue(false));
        this.CreateForeignKeyColIfNotExists("TemplateStages", "AuditRoleId", "Role");
        this.CreateForeignKeyColIfNotExists("TemplateStages", "AssessmentId", "Assessment");

        this.CreateForeignKeyColIfNotExists("Process", "ComplianceId", "Compliance");

        this.CreateForeignKeyColIfNotExists("MetricGroup", "ComplianceId", "Compliance");
        this.CreateForeignKeyColIfNotExists("MetricGroup", "Industry", "Industry");
        this.CreateColIfNotExists("MetricGroup", "Label", col => col.AsString().Nullable());
        this.CreateColIfNotExists("MetricGroup", "ParentId", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("MetricGroup", "IsHierarchy", col => col.AsBoolean().Nullable().WithDefaultValue(false));

        this.CreateTableAndAddStandardColumns("ProcessStages");
        this.CreateForeignKeyColIfNotExists("ProcessStages", "TemplateStageId", "TemplateStages");
        this.CreateForeignKeyColIfNotExists("ProcessStages", "ComplianceId", "Compliance");
        this.CreateForeignKeyColIfNotExists("ProcessStages", "GroupId", "MetricGroup");
        this.CreateColIfNotExists("ProcessStages", "Status", col => col.AsInt64().Nullable());
        this.CreateForeignKeyColIfNotExists("ProcessStages", "AuditId", "CreateAudit");
        this.CreateJsonBColIfNotExists("ProcessStages", "ResponseJson");
        this.CreateColIfNotExists("ProcessStages", "Reason", col => col.AsString().Nullable());
        this.CreateColIfNotExists("ProcessStages", "QueryStatus", col => col.AsInt64().Nullable());

        this.CreateTableAndAddStandardColumns("PDFReports");
        this.CreateColIfNotExists("PDFReports", "ReportName", col => col.AsString().Nullable());
        this.CreateColIfNotExists("PDFReports", "Guid", col => col.AsString().Nullable());
        this.CreateColIfNotExists("PDFReports", "PageNumber", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("PDFReports", "URL", col => col.AsString().Nullable());
        this.CreateColIfNotExists("PDFReports", "Type", col => col.AsString().Nullable());
        this.CreateColIfNotExists("PDFReports", "DatasetName", col => col.AsString().Nullable());

        this.CreateColIfNotExists("CreateAudit", "Name", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("CreateAudit", "AuditingProcess", "Process");
        this.CreateColIfNotExists("CreateAudit", "StartDate", col => col.AsDateTime().Nullable());
        this.CreateColIfNotExists("CreateAudit", "EndDate", col => col.AsDateTime().Nullable());
        this.CreateForeignKeyColIfNotExists("CreateAudit", "RequestedBy", "AppUser");
        this.CreateForeignKeyColIfNotExists("CreateAudit", "PeriodId", "Period");
        this.CreateColIfNotExists("CreateAudit", "AssessmentGroup", col => col.AsString().Nullable());

        this.CreateTableAndAddStandardColumns("UploadedFile");
        this.CreateColIfNotExists("UploadedFile", "Name", col => col.AsString().Nullable());
        this.CreateColIfNotExists("UploadedFile", "BlobURL", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("UploadedFile", "TemplateId", "Template");
        this.CreateForeignKeyColIfNotExists("UploadedFile", "UploadedFileStatusId", "UploadedFileStatus");
        this.CreateForeignKeyColIfNotExists("UploadedFile", "GoalSettingId", "GoalSetting");
        this.CreateForeignKeyColIfNotExists("UploadedFile", "MetricStandardId", "MetricStandard");
        this.CreateForeignKeyColIfNotExists("UploadedFile", "AssessmentId", "Assessment");
        this.CreateForeignKeyColIfNotExists("UploadedFile", "TemplateStageId", "TemplateStages");
        this.CreateForeignKeyColIfNotExists("UploadedFile", "AuditId", "CreateAudit");
        this.CreateColIfNotExists("UploadedFile", "MetricId", col => col.AsInt64().Nullable());

        this.CreateTableAndAddStandardColumns("TemplateGroup");
        this.CreateForeignKeyColIfNotExists("TemplateGroup", "TemplateId", "Template");
        this.CreateForeignKeyColIfNotExists("TemplateGroup", "MetricGroupId", "MetricGroup");
        this.CreateForeignKeyColIfNotExists("TemplateGroup", "MetricId", "Metric");

        this.CreateTableAndAddStandardColumns("Queries");
        this.CreateForeignKeyColIfNotExists("Queries", "ProcessName", "Process");
        this.CreateForeignKeyColIfNotExists("Queries", "AssignedTo", "Role");
        this.CreateColIfNotExists("Queries", "QueryDescription", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Queries", "Response", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Queries", "Status", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("Queries", "IsChangeNeeded", col => col.AsBoolean().NotNullable().WithDefaultValue(false));
        this.CreateForeignKeyColIfNotExists("Queries", "TemplateStageId", "TemplateStages");
        this.CreateForeignKeyColIfNotExists("Queries", "AuditId", "CreateAudit");
        this.CreateForeignKeyColIfNotExists("Queries", "ProcessStageId", "ProcessStages");

        this.CreateTableAndAddStandardColumns("FiscalYear");
        this.CreateColIfNotExists("FiscalYear", "Year", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("FiscalYear", "StartMonth", col => col.AsString().Nullable());
        this.CreateColIfNotExists("FiscalYear", "EndMonth", col => col.AsString().Nullable());

        this.CreateColIfNotExists("Period", "YearName", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Period", "Month", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("Period", "FiscalYearId", "FiscalYear");
        this.CreateForeignKeyColIfNotExists("Period", "Quatter", "Quatter");

        this.CreateTableAndAddStandardColumns("MetricStandard");
        this.CreateForeignKeyColIfNotExists("MetricStandard", "YearId", "Period");
        this.CreateJsonBColIfNotExists("MetricStandard", "StandardJson");
        this.CreateForeignKeyColIfNotExists("MetricStandard", "UploadedFileId", "UploadedFile");

        this.CreateTableAndAddStandardColumns("GoalSetting");
        this.CreateColIfNotExists("GoalSetting", "Name", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("GoalSetting", "YearId", "Period");
        this.CreateJsonBColIfNotExists("GoalSetting", "TargetJson");
        this.CreateForeignKeyColIfNotExists("GoalSetting", "UploadedFileId", "UploadedFile");

        this.CreateColIfNotExists("Uploadedfiledata", "RejectedComments", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Uploadedfiledata", "Status", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Uploadedfiledata", "QcStatus", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("Uploadedfiledata", "ProcessStageId", "ProcessStages");
        this.CreateForeignKeyColIfNotExists("Uploadedfiledata", "AppUserId", "AppUser");
        this.CreateForeignKeyColIfNotExists("Uploadedfiledata", "UploadedFileId", "UploadedFile");
        this.CreateJsonBColIfNotExists("Uploadedfiledata", "ColumnData");
        this.CreateColIfNotExists("Uploadedfiledata", "IsForm", col => col.AsBoolean().WithDefaultValue(false));
        this.CreateForeignKeyColIfNotExists("Uploadedfiledata", "AssessmentId", "AssessmentQ");
        this.CreateForeignKeyColIfNotExists("UploadedFiledata", "TemplateStageId", "TemplateStages");
        this.CreateForeignKeyColIfNotExists("UploadedFiledata", "AuditId", "CreateAudit");

        this.CreateColIfNotExists("Assessment", "MetricGroupId", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("Assessment", "RoleId", "Role");
        this.CreateForeignKeyColIfNotExists("Assessment", "ServiceId", "Service");
        this.CreateColIfNotExists("Assessment", "Name", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("Assessment", "TemplateId", "Template");

        this.CreateColIfNotExists("Threshold", "Date", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("Threshold", "AssetCode", col => col.AsString().Nullable());
        this.CreateColIfNotExists("Threshold", "Value", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("Threshold", "Metric", col => col.AsString().Nullable());

        this.CreateColIfNotExists("TemplateMapping", "SourceColumn", col => col.AsString().Nullable());
        this.CreateColIfNotExists("TemplateMapping", "DestinationColumn", col => col.AsString().Nullable());
        this.CreateColIfNotExists("TemplateMapping", "IsIdColumn", col => col.AsBoolean().WithDefaultValue(false));
        this.CreateColIfNotExists("TemplateMapping", "Datatype", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("TemplateMapping", "TemplateId", "Template");

        this.CreateColIfNotExists("BESCOM", "Month", col => col.AsString().Nullable());
        this.CreateColIfNotExists("BESCOM", "Unit", col => col.AsString().Nullable());
        this.CreateColIfNotExists("BESCOM", "Amount", col => col.AsDecimal(10, 2).Nullable());
        this.CreateForeignKeyColIfNotExists("BESCOM", "FiscalYearId", "FiscalYear");
        this.CreateForeignKeyColIfNotExists("BESCOM", "QuarterId", "Quatter");
        this.CreateColIfNotExists("BESCOM", "Standard", col => col.AsDecimal(10, 2).Nullable());

        this.CreateColIfNotExists("EmployeeDetails", "EmployeeId", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "Name", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "BusinessUnit", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "BloodGroup", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "DOJ", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "DOL", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "Gender", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "ESI", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "PF", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "LWF", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "Designation", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "OnboardingStatus", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "OfferReleasedDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "OfferAcceptedDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "EmploymentType", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "Client", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "StaffingStartDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "StaffingEndDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "StaffingStatus", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "WorkingLocation", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "WorkingState", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "Education", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "HealthInsurance", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "AccidentalInsurance", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "TrainingInduction", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "HealthAndSafetyMeasures", col => col.AsString().Nullable());
        this.CreateColIfNotExists("EmployeeDetails", "SkillUpgradation", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("EmployeeDetails", "FiscalYearId", "FiscalYear");

        this.CreateColIfNotExists("BWSSB", "Month", col => col.AsString().Nullable());
        this.CreateColIfNotExists("BWSSB", "Unit", col => col.AsString().Nullable());
        this.CreateColIfNotExists("BWSSB", "Amount", col => col.AsDecimal(10, 2).Nullable());
        this.CreateForeignKeyColIfNotExists("BWSSB", "FiscalYearId", "FiscalYear");
        this.CreateForeignKeyColIfNotExists("BWSSB", "QuarterId", "Quatter");
        this.CreateColIfNotExists("BWSSB", "Standard", col => col.AsDecimal(10, 2).Nullable());

        this.CreateColIfNotExists("TaskAction", "Description", col => col.AsString().Nullable());
        this.CreateColIfNotExists("TaskAction", "PlannedStartDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("TaskAction", "PlannedEndDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("TaskAction", "ActualStartDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("TaskAction", "ActualEndDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("TaskAction", "Status", col => col.AsInt64().Nullable());
        this.CreateForeignKeyColIfNotExists("TaskAction", "ObjectId", "Type");
        this.CreateColIfNotExists("TaskAction", "ObjectName", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("TaskAction", "MetricId", "Metric");

        this.CreateColIfNotExists("MergeReport", "Name", col => col.AsString().Nullable());
        this.CreateColIfNotExists("MergeReport", "Description", col => col.AsString().Nullable());
        this.CreateColIfNotExists("MergeReport", "PdfId", col => col.AsString().Nullable());

        this.CreateForeignKeyColIfNotExists("AuditIssue", "AuditId", "CreateAudit");
        this.CreateColIfNotExists("AuditIssue", "IssueReason", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("AuditIssue", "AssignedTo", "Role");
        this.CreateColIfNotExists("AuditIssue", "StartDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("AuditIssue", "EndDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("AuditIssue", "IssueStatus", col => col.AsString().Nullable());

        this.CreateForeignKeyColIfNotExists("DataIngestion", "MetricGroupId", "MetricGroup");
        this.CreateForeignKeyColIfNotExists("DataIngestion", "TimeDimension", "TimeDimension");
        this.CreateForeignKeyColIfNotExists("DataIngestion", "UOM", "UOM");
        this.CreateJsonBColIfNotExists("DataIngestion", "Data");
        this.CreateColIfNotExists("DataIngestion", "ConversionFormulae", col => col.AsString().Nullable());
        this.CreateJsonBColIfNotExists("DataIngestion", "CalculatedJson");
        this.CreateJsonBColIfNotExists("DataIngestion", "TimeDimensionData");
        this.CreateForeignKeyColIfNotExists("DataIngestion", "Month", "Months");
        this.CreateColIfNotExists("DataIngestion", "Year", col => col.AsInt64().Nullable());
        this.CreateJsonBColIfNotExists("DataIngestion", "Total");
        this.CreateForeignKeyColIfNotExists("DataIngestion", "QuarterId", "Quatter");

        this.CreateForeignKeyColIfNotExists("CalculationProcess", "FormulaStandardId", "FormulaStandards");
        this.CreateColIfNotExists("CalculationProcess", "FormulaInput", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("CalculationProcess", "FormulaOutput", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("CalculationProcess", "TimeDimension", "TimeDimension");
        this.CreateColIfNotExists("CalculationProcess", "MetricId", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("CalculationProcess", "ExcelFormulae", col => col.AsString().Nullable());

        this.CreateForeignKeyColIfNotExists("MGMultiselection", "MetricId", "Metric");
        this.CreateForeignKeyColIfNotExists("MGMultiselection", "MetricGroupId", "MetricGroup");

        this.CreateTableAndAddStandardColumns("AirEmissionReport");
        this.CreateColIfNotExists("AirEmissionReport", "ReportName", col => col.AsString().Nullable());
        this.CreateColIfNotExists("AirEmissionReport", "Guid", col => col.AsString().Nullable());
        this.CreateColIfNotExists("AirEmissionReport", "PageNumber", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("AirEmissionReport", "URL", col => col.AsString().Nullable());
        this.CreateColIfNotExists("AirEmissionReport", "Type", col => col.AsString().Nullable());

        this.CreateForeignKeyColIfNotExists("Facility", "ParentId", "Facility");
        this.CreateForeignKeyColIfNotExists("BusinessUnits", "ParentId", "BusinessUnits");
        this.CreateForeignKeyColIfNotExists("Currency", "ParentId", "Currency");
        this.CreateForeignKeyColIfNotExists("Organizations", "ParentId", "Organizations");
        this.CreateForeignKeyColIfNotExists("Language", "ParentId", "Language");
        this.CreateForeignKeyColIfNotExists("Department", "ParentId", "Department");

        this.CreateColIfNotExists("BusinessHours", "Name", col => col.AsString().Nullable());
        this.CreateColIfNotExists("BusinessHours", "StartTime", col => col.AsString().Nullable());
        this.CreateColIfNotExists("BusinessHours", "EndTime", col => col.AsString().Nullable());
        this.CreateForeignKeyColIfNotExists("BusinessHours", "StartDay", "WeeksMaster");
        this.CreateForeignKeyColIfNotExists("BusinessHours", "EndDay", "WeeksMaster");
        this.CreateColIfNotExists("BusinessHours", "IsGlobal", col => col.AsBoolean().WithDefaultValue(false));
        this.CreateForeignKeyColIfNotExists("BusinessHours", "FiscalYearId", "FiscalYear");
        this.CreateColIfNotExists("BusinessHours", "BusinessTimeZone", col => col.AsString().Nullable());

        this.CreateColIfNotExists("BusinessHoliday", "Name", col => col.AsString().Nullable());
        this.CreateColIfNotExists("BusinessHoliday", "StartDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("BusinessHoliday", "EndDate", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateForeignKeyColIfNotExists("BusinessHoliday", "BriefBusinessHours", "BusinessHours");

        this.CreateColIfNotExists("APIMetaData", "BaseURL", col => col.AsString().Nullable());
        this.CreateColIfNotExists("APIMetaData", "Secretkey", col => col.AsString().Nullable());

        this.CreateForeignKeyColIfNotExists("APIIntegration", "APIId", "APIMetaData");
        this.CreateColIfNotExists("APIIntegration", "Path", col => col.AsString().Nullable());
        this.CreateColIfNotExists("APIIntegration", "Type", col => col.AsString().Nullable());
        this.CreateColIfNotExists("APIIntegration", "Parameter", col => col.AsString().Nullable());

        this.CreateColIfNotExists("SLAProcess", "RealTimeStatus", col => col.AsString().Nullable());
        this.CreateColIfNotExists("SLAProcess", "ActionStatus", col => col.AsString().Nullable());
        this.CreateColIfNotExists("SLAProcess", "EscalationStatus", col => col.AsString().Nullable());
        this.CreateColIfNotExists("SLAProcess", "ActionTime", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("SLAProcess", "EscalationTime", column => column.AsDateTimeOffset().WithDefaultValue(SystemMethods.CurrentDateTime).Nullable());
        this.CreateColIfNotExists("SLAProcess", "ObjectName", col => col.AsString().Nullable());
        this.CreateColIfNotExists("SLAProcess", "ObjectId", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("SLAProcess", "SLAProcessId", col => col.AsInt64().Nullable());

        this.CreateColIfNotExists("SLAConfig", "TableName", col => col.AsString().Nullable());
        this.CreateColIfNotExists("SLAConfig", "TriggerType", col => col.AsString().Nullable());
        this.CreateColIfNotExists("SLAConfig", "RealTime", col => col.AsBoolean().WithDefaultValue(false));
        this.CreateColIfNotExists("SLAConfig", "Action", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("SLAConfig", "Escalation", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("SLAConfig", "ActionTime", col => col.AsInt64().Nullable());
        this.CreateColIfNotExists("SLAConfig", "EscalationTime", col => col.AsInt64().Nullable());

        this.CreateColIfNotExists("ValueMaster", "Name", col => col.AsString().Nullable());
        this.CreateJsonBColIfNotExists("ValueMaster", "ConfigJson");

        this.CreateForeignKeyColIfNotExists("UploadedJson", "MetricId", "Metric");
        this.CreateJsonBColIfNotExists("UploadedJson", "MetricJson");
        this.CreateForeignKeyColIfNotExists("UploadedJson", "UploadedFileId", "UploadedFile");

        this.CreateColIfNotExists("GHGMaster", "Unit", col => col.AsString().Nullable());
        this.CreateColIfNotExists("GHGMaster", "Type", col => col.AsString().Nullable());
        this.CreateColIfNotExists("GHGMaster", "Value", col => col.AsString().Nullable());
    }

    public override void Down()
    {
    }
}