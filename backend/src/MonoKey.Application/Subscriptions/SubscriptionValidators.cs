using FluentValidation;

namespace MonoKey.Application.Subscriptions;

public sealed class CreateSubscriptionCommandValidator : AbstractValidator<CreateSubscriptionCommand>
{
    public CreateSubscriptionCommandValidator(TimeProvider timeProvider)
    {
        RuleFor(command => command.ClientRequestId).Must(value => value is null || value != Guid.Empty);
        RuleFor(command => command.Name).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Amount).GreaterThanOrEqualTo(0);
        RuleFor(command => command.CurrencyCode).NotEmpty().Matches("^[A-Za-z]{3}$");
        RuleFor(command => command.BillingIntervalUnit).IsInEnum();
        RuleFor(command => command.BillingIntervalCount).GreaterThan(0);

        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        RuleFor(command => command.NextRenewalDate)
            .GreaterThanOrEqualTo(today)
            .WithMessage("Next renewal date cannot be in the past.");
    }
}

public sealed class UpdateSubscriptionCommandValidator : AbstractValidator<UpdateSubscriptionCommand>
{
    public UpdateSubscriptionCommandValidator(TimeProvider timeProvider)
    {
        RuleFor(command => command.Name).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Amount).GreaterThanOrEqualTo(0);
        RuleFor(command => command.CurrencyCode).NotEmpty().Matches("^[A-Za-z]{3}$");
        RuleFor(command => command.BillingIntervalUnit).IsInEnum();
        RuleFor(command => command.BillingIntervalCount).GreaterThan(0);

        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        RuleFor(command => command.NextRenewalDate)
            .GreaterThanOrEqualTo(today)
            .WithMessage("Next renewal date cannot be in the past.");
        RuleFor(command => command.Status).IsInEnum();
        RuleFor(command => command.ConcurrencyToken).NotEmpty();
    }
}
