<!DOCTYPE html>
<html>
<head>
    <title>Complaint Notification</title>
</head>
<body>
    <h2>New Complaint Submitted</h2>

    <p><strong>Submitted by:</strong> {{ $complaint->user->name ?? 'Unknown User' }}</p>
    <p><strong>User Email:</strong> {{ $complaint->user->email ?? 'N/A' }}</p>
    <p><strong>Subject:</strong> {{ $complaint->subject }}</p>
    <p><strong>Description:</strong> {{ $complaint->description }}</p>
    <p><strong>Status:</strong> {{ ucfirst($complaint->status) }}</p>

    <p>Submitted on: {{ $complaint->created_at->format('Y-m-d H:i') }}</p>
</body>
</html>
