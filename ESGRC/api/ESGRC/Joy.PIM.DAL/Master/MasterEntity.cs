namespace Joy.PIM.DAL.Master
{
    public abstract class MasterEntity : Entity
    {
        public string Description { get; set; }

        public string Name { get; set; }

        public long Code { get; set; }
    }
}