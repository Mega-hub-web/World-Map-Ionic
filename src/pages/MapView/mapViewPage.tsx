import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import WorldMap from '../../components/world-map';

const MapViewPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="ion-no-padding">
        <div className="w-full h-full bg-gray-900">
          <WorldMap />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MapViewPage;
