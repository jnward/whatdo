import React from 'react';
import Log from './Log';

const LogContainer = (props) => {
    const logsData = props.logsData;
    const theme = props.theme;
    // console.log(logs);
    let logs = [];
    for (let logData of logsData) {
        const log = <Log key={logData.id} id={logData.id} body={logData.body} timestamp={logData.timestamp} theme={theme}/>;
        logs.push(log);
    }
    return (
        <>{logs}</>
    );
}

export default LogContainer;