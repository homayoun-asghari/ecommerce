import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useNotification } from "../contexts/NotificationContext";

function Notifications() {
    const {notifications, makeRead} = useNotification();

    return (
        <div>
            {notifications.map(n => (
                <Card key={n.id} className="mb-3" bg={!n.is_read && "success"} text={!n.is_read && "white"}>
                    <Card.Header>{n.title}</Card.Header>
                    <Card.Body>
                        <Card.Text>{n.message}</Card.Text>
                        {!n.is_read && (
                            <Button variant="light" size="sm" onClick={() => makeRead(n.id)}>
                                Mark as read
                            </Button>
                        )}
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
}

export default Notifications;
