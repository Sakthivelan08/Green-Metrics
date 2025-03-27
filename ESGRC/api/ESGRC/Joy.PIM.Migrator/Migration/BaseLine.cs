using System.IO;
using FluentMigrator;

namespace Joy.PIM.Migrator.Migration
{
    [Migration(1)]
    public class BaseLine : FluentMigrator.Migration
    {
        public override void Up()
        {
            this.Execute.Sql(File.ReadAllText("BaselineUp.sql"));

            this.CreateTableAndAddStandardColumns("AppUser", false);
            this.CreateTableAndAddStandardColumns("AppSettings");
            this.CreateMasterTable("MetricGroup");
            this.CreateMasterTable("StandardMaster");
            this.CreateMasterTable("AppUserRole");
            this.CreateMasterTable("AuditType");
            this.CreateMasterTable("Label");
            this.CreateMasterTable("Role");
            this.CreateMasterTable("Language");
            this.CreateMasterTable("AuditTeam");
            this.CreateMasterTable("Audit");

            this.CreateColIfNotExists("AppUser", "Email", column => column.AsString().NotNullable());
            this.CreateColIfNotExists("AppUser", "Name", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppUser", "Password", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppUser", "VerificationKey", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppUser", "EncryptionKey", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppUser", "IsEmailVerified", column => column.AsBoolean().Nullable());
            this.CreateColIfNotExists("AppUser", "HasAcceptedTerms", column => column.AsBoolean().Nullable());
            this.CreateColIfNotExists("AppUser", "HasAcceptedPrivacyPolicy", column => column.AsBoolean().Nullable());
            this.CreateColIfNotExists("AppUser", "IsDeleted", column => column.AsBoolean().Nullable());
            this.CreateColIfNotExists("AppUser", "Address", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppUser", "FirstName", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppUser", "LastName", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppUser", "Mobile", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppUser", "VerificationKeyExpiryTime", column => column.AsDateTimeOffset().Nullable());

            this.CreateColIfNotExists("AppSettings", "Name", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppSettings", "Description", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppSettings", "Value", column => column.AsString().Nullable());
            this.CreateColIfNotExists("AppSettings", "JsonValue", column => column.AsString().Nullable());

            this.CreateForeignKeyColIfNotExists("AppUser", "CreatedBy", "AppUser");
            this.CreateForeignKeyColIfNotExists("AppUser", "UpdatedBy", "AppUser");

            this.CreateForeignKeyColIfNotExists("AppUserRole", "AppUserId", "AppUser", isnullable: false);
            this.CreateForeignKeyColIfNotExists("AppUserRole", "RoleId", "Role", isnullable: false);

            this.CreateForeignKeyColIfNotExists("Label", "LanguageId", "Language");

            this.CreateColIfNotExists("Role", "Guid", column => column.AsString().NotNullable());

            this.Execute.Sql(
                "INSERT INTO APPUSER(ID, CREATEDBY, UPDATEDBY, EMAIL, FIRSTNAME, LASTNAME, ISACTIVE, ISDELETED) VALUES (1, 1, 1, 'hcpimtester@yopmail.com', 'Admin', 'Admin', true, false)");
        }

        public override void Down()
        {
        }
    }
}