# Generated by Django 5.2.3 on 2025-06-28 11:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_customuser_address_customuser_emergency_contact_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='dob',
            field=models.DateField(blank=True, null=True),
        ),
    ]
