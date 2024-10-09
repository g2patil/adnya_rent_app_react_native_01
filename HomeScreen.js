import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

export default HomeScreen = ({ navigation }) => {
  const options = [
    { id: 0, title: 'Add Patient', source: require('./assets/patient.png'), path: 'Add_Patient' },
    { id: 1, title: 'Search Patient', source: require('./assets/search.png'), path :'Patient_Search' },
    { id: 2, title: 'Create OPD', source: require('./assets/opd.png'), path: 'Add_Opd'  },
    { id: 3, title: 'Create OPD', source: require('./assets/blk.png'),path:'OPDSearch' },
    { id: 4, title: 'Issue Medical Cretificate', source: require('./assets/blk.png') },
    { id: 5, title: 'Logout', source: require('./assets/blk.png') , path :'Logout_Button'  },
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
    marginTop: 40,
    backgroundColor: '#f6f6f6',
  },
  list: {
    paddingHorizontal: 5,
    backgroundColor: '#f6f6f6',
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
    marginVertical: 20,
    marginHorizontal: 40,
    backgroundColor: '#e2e2e2',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    height: 100,
    width: 100,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    flex: 1,
    alignSelf: 'center',
    color: '#696969',
  },
});
