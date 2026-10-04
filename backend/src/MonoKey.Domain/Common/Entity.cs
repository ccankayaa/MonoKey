namespace MonoKey.Domain.Common;

public abstract class Entity
{
    protected Entity()
    {
        Id = Guid.CreateVersion7();
    }

    protected Entity(Guid id)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException("An entity ID is required.", nameof(id));
        }

        Id = id;
    }

    public Guid Id { get; private set; }
}
