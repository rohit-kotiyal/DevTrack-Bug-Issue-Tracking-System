from django.db import models
from users.models import User

# Create your models here.

class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_prjects")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class ProjectMember(models.Model):
    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("DEV", "Developer"),
        ("VIEWER", "Viewer"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    class Meta:
        unique_together = ("user", "project")

    def __str__(self):
        return f"{self.user.email} -> {self.project.name} ({self.role})"