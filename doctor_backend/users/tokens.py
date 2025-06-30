from django.contrib.auth.tokens import PasswordResetTokenGenerator
from datetime import datetime, timedelta
from django.utils import timezone

class ExpiringTokenGenerator(PasswordResetTokenGenerator):
    def _make_timestamp(self, user):
        # Use default method (uses days since 2001-1-1)
        return super()._make_timestamp(user)

    def check_token(self, user, token):
        # Check if the token is valid and not expired
        if not super().check_token(user, token):
            return False

        # Custom expiration: 1 hour (3600 seconds)
        # Decode timestamp from token
        ts_b36 = token.split("-")[1]
        try:
            ts_int = self._num_days(self._today()) - int(ts_b36, 36)
        except ValueError:
            return False

        # Calculate age in seconds
        token_lifetime_seconds = 3600  # 1 hour
        ts_created = datetime(2001, 1, 1) + timedelta(days=int(ts_b36, 36))
        now = timezone.now()
        if (now - ts_created).total_seconds() > token_lifetime_seconds:
            return False

        return True

token_generator = ExpiringTokenGenerator()
