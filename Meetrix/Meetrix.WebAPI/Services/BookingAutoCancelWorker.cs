using Meetrix.Core.Contracts;

namespace Meetrix.WebAPI.Services
{
    public class BookingAutoCancelWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BookingAutoCancelWorker> _logger;

        public BookingAutoCancelWorker(
            IServiceScopeFactory scopeFactory,
            ILogger<BookingAutoCancelWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var bookingService = scope.ServiceProvider.GetRequiredService<IBookingService>();

                    _logger.LogInformation("Auto-cancel check started at {time}", DateTime.Now);

                    var cancelledCount = await bookingService.AutoCancelNoShowBookingsAsync(stoppingToken);

                    if (cancelledCount > 0)
                    {
                        _logger.LogInformation(
                            "Auto-cancelled {Count} no-show booking(s) at {Time}",
                            cancelledCount,
                            DateTime.Now);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while auto-cancelling no-show bookings.");
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}
