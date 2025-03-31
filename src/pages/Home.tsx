import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import HomePage from './HomePage';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      {/*<IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>*/}
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          {/* <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar> */}
        </IonHeader>
        <HomePage />
      </IonContent>
    </IonPage>
  );
};

export default Home;
