import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, SafeAreaView, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { RadioButton } from 'react-native-paper';
import {useState, useEffect} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import AsyncStorage from '@react-native-async-storage/async-storage';

const amountKey = '@MyApp:amountKey';

const Drawer = createNativeStackNavigator();
// SplashScreen.preventAutoHideAsync();
// setTimeout(SplashScreen.hideAsync, 2000);


export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Input Transaction" component={Input} options={{
          headerStyle: {
            backgroundColor: '#3381ff',
          },
          headerTintColor: 'white',
          }} />
        <Drawer.Screen name="Transaction Details" component={TransactionDetails} options={{
          headerStyle: {
            backgroundColor: '#3381ff',
          },
          headerTintColor: 'white',
          }} />
          <Drawer.Screen name="All Transactions" component={Items} options={{
          headerStyle: {
            backgroundColor: '#3381ff',
          },
          headerTintColor: 'white',
          }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

function Items({navigation}) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select amount, desc, type, category, date from item`, [],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={{height: "auto"}}>
        <ScrollView style={styles.scrollView}>
          {items.map(({ id, amount, desc, type, category, date }) => (
          <View>
            {/* <Text>Amount: {amount}</Text>
            <Text>desc: {desc}</Text>
            <Text>type: {type}</Text>
            <Text>category: {category}</Text>
            <Text>date: {date}</Text>
            <Text> {}</Text> */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Transaction Details', {
                    amount: amount,
                    date: date,
                    desc: desc,
                    type: type,
                    value: category,
                    newTransactionew: false,
                  })
                }>
                <View style={styles.row}>
                  <View style={styles.iconContainer}>
                    <Image source={require('./assets/bankVaultIcon.png')} style={styles.icon} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.items}>${Math.abs(amount)}</Text>
                    <Text style={styles.address}>{desc}</Text>
                    
                  </View>
                </View>
              </TouchableOpacity> 
            </View>        
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();



const isValid = (amount, date, desc) =>{

  const datePattern = /^\d{2}[/]\d{2}[/]\d{2}$/;
  let errorMessage = "";
  if(amount == null || amount <= 0){
    errorMessage += "Amount needs to have a valid number that is greater than $0\n";
  }
  if(!datePattern.test(date) || date == null){
    errorMessage += "Date needs to be a valid date and in the form (mm/dd/yy)\n";
  }
  if(desc == null || desc == ""){
    errorMessage += "Description needs to have a value in it";
  }

  return errorMessage;
}

function Input({navigation}){
  const [amount, setAmount] = useState(null);
  const [date, setDate] = useState(null);
  const [desc, setDesc] = useState(null);
  const [type, setType] = useState('withdraw');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('misc');
  const [items, setItems] = useState([
    {label: 'Misc.', value: 'misc'},
    {label: 'Food', value: 'food'},
    {label: 'Entertainment', value: 'entr'},
    {label: 'Groceries', value: 'groc'},
    {label: 'Bills', value: 'bill'},
    {label: 'Gas', value: 'gas'},
  ]);
  

  return(
    <View style={styles.container}>
      <Text style={styles.text} >Amount</Text>
      <TextInput style={styles.amountInput} keyboardType="numeric" onChangeText={newAmount => setAmount(newAmount)} />

    <RadioButton.Group onValueChange={type => setType(type)} value={type} style={styles.radio}>
      <RadioButton.Item label="Withdraw" value="withdraw" />
      <RadioButton.Item label="Deposit" value="deposit" />
    </RadioButton.Group>

    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      style={styles.dropDown}
    />

      <Text style={styles.text} >Date (mm/dd/yy)</Text>
      <TextInput style={styles.dateInput} onChangeText={newDate => setDate(newDate)} />

      <Text style={styles.text}>Description</Text>
      <TextInput style={styles.descInput} onChangeText={newDesc => setDesc(newDesc)} />

      <Pressable
        style={styles.button}
        onPress={() => {
          if(isValid(amount, date, desc) != ""){
            alert(isValid(amount, date, desc, items));
          }else {
            navigation.navigate('Transaction Details', {
              amount: amount,
              date: date,
              desc: desc,
              type: type,
              value: value,
              newTransaction: true,
            });
          }
        }}>
          <Text style={styles.buttonText}>Input Transaction</Text>  
        </Pressable>
        <Pressable
        style={styles.button}
        onPress={() => {
            navigation.navigate('All Transactions');
        }}>
          <Text style={styles.buttonText}>See All Transactions</Text>  
        </Pressable>

        <Image style={styles.image}
        source={require('./assets/bankVaultIcon.png')} />


      <StatusBar style="auto" />
    </View>
  );
}

function TransactionDetails({route, navigation}) {
  const { amount, date, desc, type, value, newTransaction } = route.params;
  useEffect(() => {
    db.transaction((tx) => {
      // tx.executeSql(
      //   "drop table item;"
      // );
      tx.executeSql(
        "create table if not exists item (id integer primary key not null, amount integer, desc varchar, type varchar, category varchar, date varchar);"
      );
    });
  }, []);

  const onSave = async () => {
    if(type == "deposit"){
      db.transaction(
        (tx) => {
          tx.executeSql("insert into item (amount, desc, type, category, date) values (?, ?, ?, ?, ?)", [amount, desc, type, value, date]);
          tx.executeSql("select * from item", [], (_, { rows }) =>
            console.log(JSON.stringify(rows))
          );
        },
        null
      );
      } else {
        db.transaction(
          (tx) => {
            tx.executeSql("insert into item (amount, desc, type, category, date) values (?, ?, ?, ?, ?)", [amount * -1, desc, type, value, date]);
            tx.executeSql("select * from item", [], (_, { rows }) =>
              console.log(JSON.stringify(rows))
            );
          },
          null
        );
      }
  }
  
  if (newTransaction){
    return(
      <View styles={styles.container}>
        <Text style={styles.detailsText }>Is this transaction correct?{'\n\n'}</Text>

        <Text style={styles.text}>
        Amount:  ${amount} {'\n\n'}
        Transaction Type:  {type} {'\n\n'}
        Catagory:  {value} {'\n\n'}
        Date:  {date} {'\n\n'}
        Description: {desc}
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => {
            onSave();
            navigation.navigate('All Transactions');
          }}>
            <Text style={styles.buttonText}>Confirm Transaction</Text>  
          </Pressable>

          <Image style={styles.image}
          source={require('./assets/bankVaultIcon.png')} />
      </View>
    );
  } else {
    return(
      <View styles={styles.container}>
        <Text style={styles.detailsText }>Your Transaction{'\n\n'}</Text>

        <Text style={styles.text}>
        Amount:  ${amount} {'\n\n'}
        Transaction Type:  {type} {'\n\n'}
        Catagory:  {value} {'\n\n'}
        Date:  {date} {'\n\n'}
        Description: {desc}
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => {
            navigation.navigate('All Transactions');
          }}>
            <Text style={styles.buttonText}>See All Transactions</Text>  
          </Pressable>

          <Image style={styles.image}
          source={require('./assets/bankVaultIcon.png')} />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    marginHorizontal: 20,
  },
  image :{
    height: 200,
    width: 200,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  row: {
    borderColor: '#7b7983',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#1f3243',
    borderRadius: 40,
    borderWidth: 1,
    justifyContent: 'center',
    height: 70,
    width: 70,
  },
  info: {
    flex: 1,
    color: "#122737",
    fontSize: 18,
    paddingLeft: 25,
    paddingRight: 25,
  },
  items: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  address: {
    color: '#3c4f62',
    fontSize: 16,
  },
  icon: {
    height: 60,
    width: 60,
  },
  header: {
    textAlign: 'center',
    backgroundColor: '#3381ff',
    fontSize: 28,
    padding: 20,
    fontWeight: 'bold',
    color: 'white',
    height: 75,
  },
  text: {
    fontSize: 24,
    marginLeft:40,
  },
  detailsText: {
    fontSize: 30,
    marginLeft:40,
    fontWeight: 'bold',
  },
  amountInput: {
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    borderRadius: 3,
    width: 100,
    height: 40,
    padding: 5,
    marginTop: 10,
    marginLeft:40,
    fontSize: 24,
  },
  dateInput: {
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    borderRadius: 3,
    width: 150,
    height: 40,
    padding: 5,
    marginTop: 10,
    marginLeft:40,
    fontSize: 24,
  },
  descInput: {
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    borderRadius: 3,
    width: 300,
    height: 40,
    padding: 5,
    marginTop: 10,
    marginLeft:40,
    fontSize: 24,
  },
  dropDown: {
    width: 150,
    marginLeft:40,
  },
  radio: {
    width: 150,
  },
  button: {
    marginBottom: 15,
    height: 50,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: "#3381ff",
    width: 300,
    margin: 12,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    
  },
});
