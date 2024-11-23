import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

export default HomeScreen = ({ navigation }) => {
  const options = [
    { id: 0, title: '', source: require('./assets/dashboard_inactive.png'), path: 'Practise' },
    { id: 1, title: '', source: require('./assets/member_inactive.png'), path :'Register_club_member' },
    { id: 2, title: '', source: require('./assets/event_inactive.png'), path: 'Add_Opd'  },
    { id: 3, title: '', source: require('./assets/announcement_inactive.png'),path:'OPDSearch' },
    { id: 4, title: '', source: require('./assets/clubresources_inactive.png'),path:'Pdf_cert' },
    { id: 5, title: '', source: require('./assets/messages_inactive.png'),path:'Pdf_cert' },
    { id: 6, title: '', source: require('./assets/paymentsbilling_inactive.png'),path:'Pdf_cert' },
    { id: 7, title: '', source: require('./assets/adminpanel_inactive.png'),path:'Pdf_cert' },
    { id: 8, title: 'Logout', source: require('./assets/logout_inactive.png') , path :'Logout_Button'  },
  ];

  const clickEventListener = (item) => {
  //  Alert.alert('Option selected', item.title);
    navigation.navigate(item.path);
  }; 

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        data={options}
        horizontal={false}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <View>
              <TouchableOpacity style={styles.card} onPress={() => clickEventListener(item)}>
                <Image style={styles.cardImage} source={item.source} />
              </TouchableOpacity>
              <View style={styles.cardHeader}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.title}>{item.title}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#ffffff',
  },
  list: {
    paddingHorizontal: 5,
    backgroundColor: '#ffffff',
  },
  listContainer: {
    alignItems: 'center',
  },
  card: {
    shadowColor: '#474747',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
    marginVertical: 10,
    marginHorizontal: 60,
    backgroundColor: '#ffffff', //e2e2e2
    width: 90,
    height: 90,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    height: 120,
    width: 120,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    flex: 1,
    alignSelf: 'center',
    color: '#696969',
  },
});
