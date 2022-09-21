from django.db import models


class Group(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()

    def __repr__(self):
        return self.name

    def __str__(self):
        return self.name


class User(models.Model):
    username = models.CharField(max_length=50, unique=True)
    create = models.DateField(auto_now_add=True)
    group = models.ForeignKey(Group, on_delete=models.RESTRICT)

    def __repr__(self):
        return self.username

    def __str__(self):
        return self.username
