BEGIN;
SET LOCAL search_path TO monokey;

INSERT INTO "user_profiles" (
    "Id", "UserId", "DisplayName", "CreatedAtUtc", "UpdatedAtUtc")
VALUES (
    '0199a001-0000-7000-8000-000000000001', :'owner_id', 'Local Development User', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "notification_preferences" (
    "Id", "UserId", "RenewalRemindersEnabled", "DaysBeforeRenewal", "CreatedAtUtc", "UpdatedAtUtc")
VALUES (
    '0199a001-0000-7000-8000-000000000002', :'owner_id', TRUE, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "devices" (
    "Id", "UserId", "DeviceIdentifier", "Name", "Platform", "LastSeenAtUtc", "CreatedAtUtc", "UpdatedAtUtc")
VALUES (
    '0199a001-0000-7000-8000-000000000003', :'owner_id', 'local-browser', 'Local Browser', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "subscriptions" (
    "Id", "UserId", "Name", "Amount", "CurrencyCode", "BillingIntervalCode", "BillingIntervalUnit",
    "BillingIntervalCount", "NextRenewalDate", "Status", "ConcurrencyToken", "CreatedAtUtc", "UpdatedAtUtc")
VALUES
    (
        '0199a001-0000-7000-8000-000000000010', :'owner_id', 'Music Plan', 9.99, 'USD', 3, 3,
        1, CURRENT_DATE + 10, 1, '0199a001-0000-7000-8000-000000000110', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        '0199a001-0000-7000-8000-000000000011', :'owner_id', 'Cloud Storage', 4.99, 'EUR', 3, 3,
        1, CURRENT_DATE + 20, 1, '0199a001-0000-7000-8000-000000000111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
ON CONFLICT DO NOTHING;

COMMIT;

SELECT 'devices' AS "Table", COUNT(*) AS "Rows" FROM "devices" WHERE "UserId" = :'owner_id'
UNION ALL
SELECT 'notification_preferences', COUNT(*) FROM "notification_preferences" WHERE "UserId" = :'owner_id'
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM "subscriptions" WHERE "UserId" = :'owner_id'
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM "user_profiles" WHERE "UserId" = :'owner_id'
ORDER BY "Table";
