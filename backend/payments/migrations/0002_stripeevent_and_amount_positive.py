from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StripeEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_id', models.CharField(max_length=255, unique=True)),
                ('event_type', models.CharField(blank=True, max_length=100)),
                ('received_at', models.DateTimeField(auto_now_add=True, db_index=True)),
            ],
            options={'ordering': ['-received_at']},
        ),
        migrations.AddConstraint(
            model_name='payment',
            constraint=models.CheckConstraint(
                condition=Q(amount_ore__gt=0),
                name='payment_amount_positive',
            ),
        ),
    ]