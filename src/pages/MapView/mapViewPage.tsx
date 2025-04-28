import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import WorldMap from '../../components/world-map';


interface Location {
    name: string;
    timezone: string;
    lat: number;
    lng: number;
}

const MapViewPage: React.FC = () => {

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="w-full h-full bg-gray-900">
                    <WorldMap
                    />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default MapViewPage;
