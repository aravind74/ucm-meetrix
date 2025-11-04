INSERT INTO [MeetrixDb].[dbo].[Facility]
           ([FacilityName]
           ,[LastUpdatedBy]
           ,[LastUpdated]
           ,[IsActive])
VALUES
    ('Whiteboard', 10000, GETDATE(), 1),
    ('Projector', 10000, GETDATE(), 1),
    ('HDMI adapter', 10000, GETDATE(), 1),
    ('VoIP setup', 10000, GETDATE(), 1),
    ('Good lighting', 10000, GETDATE(), 1);
