import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import { useEffect, useState } from 'react';

function Countdown() {
    function getEndOfDay() {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end;
      }
      
    const [targetTime, setTargetTime] = useState(getEndOfDay());

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            if (now >= targetTime) {
                setTargetTime(getEndOfDay()); // reset to next midnight
            }
        }, 1000); // check every second

        return () => clearInterval(interval);
    }, [targetTime]);

    return (
        <div style={{
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <FlipClockCountdown
                to={targetTime}
                labels={['DAYS', 'HOURS', 'MINUTES', 'SECONDS']}
                labelStyle={{
                    fontSize: '10px',  // responsive label
                    fontWeight: 500,
                    textTransform: 'uppercase'
                }}
                digitBlockStyle={{
                    width: '3vw',      // responsive width
                    height: '4vw',     // responsive height
                    fontSize: '2.5vw',    // responsive font size
                    minWidth: 20,
                    minHeight: 30,
                }}
                dividerStyle={{
                    color: '#000',
                    fontSize: '2.5vw'
                }}
            />
        </div>
    );
}
export default Countdown;
