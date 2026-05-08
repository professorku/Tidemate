from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('bookings', '0010_booking_awaiting_payment_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('provider', models.CharField(default='stripe', max_length=20)),
                ('status', models.CharField(choices=[('not_started', 'Not started'), ('checkout_created', 'Checkout created'), ('paid', 'Paid'), ('failed', 'Failed'), ('refunded', 'Refunded'), ('cancelled', 'Cancelled')], db_index=True, default='not_started', max_length=30)),
                ('amount_ore', models.PositiveIntegerField()),
                ('currency', models.CharField(default='nok', max_length=3)),
                ('stripe_checkout_session_id', models.CharField(blank=True, max_length=255, null=True, unique=True)),
                ('stripe_payment_intent_id', models.CharField(blank=True, max_length=255)),
                ('stripe_customer_id', models.CharField(blank=True, max_length=255)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('failed_at', models.DateTimeField(blank=True, null=True)),
                ('refunded_at', models.DateTimeField(blank=True, null=True)),
                ('cancelled_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('booking', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='bookings.booking')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['booking', 'status'], name='payment_booking_status_idx'),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['status', '-created_at'], name='payment_status_created_idx'),
        ),
    ]