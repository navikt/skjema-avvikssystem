import * as React from 'react';
import { useState, useEffect } from 'react';
import { TextField } from 'office-ui-fabric-react';
import styles from './TimeSpanField.module.scss';

export interface ITimeSpanFieldProps {
    label: string;
    onChange: (value: string) => void;
}

const TimeSpanField = (props: ITimeSpanFieldProps) => {
    const template = '{0}d{1}h';
    const [value, setValue] = useState({ days: '0', hours: '0' });

    useEffect(() => {
        props.onChange(template.replace('{0}', value.days).replace('{1}', value.hours));
    }, [value]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.label}><span>{props.label}</span></div>
            <div className={styles.inputs}>
                <TextField className={styles.input} type='number' onChange={(_, val) => setValue({ ...value, days: val })} /><span> Dager</span>
                <TextField className={styles.input} type='number' onChange={(_, val) => setValue({ ...value, hours: val })} /><span> Timer</span>
            </div>
        </div>
    );
};

export default TimeSpanField;