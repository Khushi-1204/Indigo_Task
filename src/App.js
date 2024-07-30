import React, { useEffect, useState } from 'react';
import './App.css';
import { requestPermission, onMessageListener } from './firebase';

const initialFlights = [
  { id: 1, number: 'Ae123', status: 'On Time', gate: 'A1' },
  { id: 2, number: 'Be456', status: 'Delayed', gate: 'B2' },
  { id: 3, number: 'Ce789', status: 'Cancelled', gate: 'C3' },
  { id: 4, number: 'De789', status: 'On Time', gate: 'D4' },
  { id: 5, number: 'Ee789', status: 'On Time', gate: 'B2' }
];

const statuses = ['On Time', 'Delayed', 'Cancelled', 'Boarding'];

const getRandomIndex = (length) => {
  return Math.floor(Math.random() * length);
};

const getRandomStatus = () => {
  return statuses[getRandomIndex(statuses.length)];
};

function App() {
  const [flights, setFlights] = useState(initialFlights);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    requestPermission().then(token => {
      if (token) {
        // Send token to server or use it to subscribe to topics
      }
    });

    onMessageListener().then(payload => {
      setNotifications(prevNotifications => [
        ...prevNotifications,
        ` Flight ${payload.notification.title} status changed to ${payload.notification.body}.`
      ]);
    }).catch(err => console.log('failed: ', err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const flightIndex = getRandomIndex(flights.length);
      const randomStatus = getRandomStatus();
      const updatedFlight = { ...flights[flightIndex], status: randomStatus };

      setFlights(prevFlights => 
        prevFlights.map(flight => 
          flight.id === updatedFlight.id ? updatedFlight : flight
        )
      );

      // Send push notification
      fetch('/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: updatedFlight.number,
          body: updatedFlight.status,
          token: 'USER_FCM_TOKEN' // Replace with the user's FCM token
        })
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [flights]);

  return (
    <div className="App">
      <h1>Flight Status</h1>
      <FlightList flights={flights} />
      <Notifications notifications={notifications} />
    </div>
  );
}

function FlightList({ flights }) {
  return (
    <div>
      {flights.map(flight => (
        <div key={flight.id} className="flight">
          <p>Flight: {flight.number}</p>
          <p>Status: {flight.status}</p>
          <p>Gate: {flight.gate}</p>
        </div>
      ))}
    </div>
  );
}

function Notifications({ notifications }) {
  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {notifications.map((notification, index) => (
        <div key={index} className="notification">
          {notification}
        </div>
      ))}
    </div>
  );
}

export default App;
