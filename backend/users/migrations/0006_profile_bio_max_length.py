from django.db import migrations, models


MAX_LENGTH = 1000


def truncate_profile_bios(apps, schema_editor):
    Profile = apps.get_model('users', 'Profile')

    for profile in Profile.objects.exclude(bio=''):
        bio = profile.bio or ''
        if len(bio) > MAX_LENGTH:
            profile.bio = bio[:MAX_LENGTH]
            profile.save(update_fields=['bio'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_user_email_ci_unique'),
    ]

    operations = [
        migrations.RunPython(
            truncate_profile_bios,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='profile',
            name='bio',
            field=models.CharField(blank=True, max_length=1000),
        ),
    ]