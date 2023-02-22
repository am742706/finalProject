import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

const Drawer = createDrawerNavigator();
SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

function Art({navigation}){
  return(
      <Image source={require('./assets/art.png')} style={styles.image} />
  );
}
function Mile({navigation}){
  return(
    <Image source={require('./assets/mile.png')} style={styles.image} />
  );
}
function Navy({navigation}){
  return(
    <Image source={require('./assets/pier.png')} style={styles.image} />
  );
}
function Water({navigation}){
  return(
    <Image source={require('./assets/water.png')} style={styles.image} />
  );
}
function Willis({navigation}){
  return(
    <Image source={require('./assets/willis.png')} style={styles.image} />
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Art Institute of Chicago" component={Art} />
        <Drawer.Screen name="Magnificent Mile" component={Mile} />
        <Drawer.Screen name="Navy Pier" component={Navy} />
        <Drawer.Screen name="Water Tower" component={Water} />
        <Drawer.Screen name="Willis Tower" component={Willis} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    height: 480,
    width: 320,
  },
});
