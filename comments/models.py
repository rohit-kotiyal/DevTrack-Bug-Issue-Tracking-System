from django.db import models
from users.models import User
from tickets.models import Ticket

# Create your models here.

class Comments(models.Model):

    comment = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="comments")
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Comment by {self.user} on Ticket #{self.ticket.id}"