from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("listings", "0002_enable_postgis_search_index"),
    ]

    operations = [
        migrations.AlterField(
            model_name="boatlisting",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="boatimage",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
    ]
