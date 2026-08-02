from app.models.alert import Alert


def create_alert(db, alert_data):
    """
    Create an alert and add it to the current database session.
    The caller is responsible for committing the transaction.
    """

    alert = Alert(**alert_data)

    db.add(alert)

    return alert