from django.db import models
from projects.models import Project
from users.models import User


class Ticket(models.Model):
    STATUS = [
        ("TODO", "To Do"),
        ("IN_PROGRESS", "In Progress"),
        ("DONE", "Done"),
    ]

    PRIORITY = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("URGENT", "Urgent"),
    ]

    ISSUE_TYPE = [
        ("BUG", "Bug"),
        ("TASK", "Task"),
        ("FEATURE", "Feature"),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    issue_type = models.CharField(
        max_length=20,
        choices=ISSUE_TYPE,
        default="TASK"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="TODO"   # 🔧 FIXED (no spaces)
    )
    order = models.IntegerField(default=0)
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY,
        default="MEDIUM"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tickets"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_tickets"
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('title', 'project')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["priority"]),
            models.Index(fields=["project"]),
            models.Index(fields=["issue_type"]),
        ]

    def __str__(self):
        return f"{self.title} [{self.issue_type}]"
