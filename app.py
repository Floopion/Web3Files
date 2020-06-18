import csv
import os
from flask import Flask, render_template, request,jsonify
from mongoengine import *
from flask_cors import CORS

#################################################################
#  Connect to Mongo. URI is for Prod. Single line connect is    #
#  for local dev environment.                                   #
#################################################################

connect(
     username='heroku_c1wldm92',
     password='eomrqnfplp7782hecehq4ahchh',
     host='mongodb://heroku_c1wldm92:eomrqnfplp7782hecehq4ahchh@ds113626.mlab.com:13626/heroku_c1wldm92?retryWrites=false',
     port=13626
)

#####################################
#   Create Tables in the database   #
#####################################

class Country(Document):
    name = StringField()
    data = DictField()


############################################################################
# set the project root directory as the static folder, you can set others. #
# old = " app = Flask(__name__) "                                          #
############################################################################
app = Flask(__name__, static_url_path='')
CORS(app)
app.config.from_object('config')


#################
#  App Routes   #
#################

#These contain the routes, which page they should display and the title of each page
@app.route('/')
@app.route('/index')
@app.route('/home')
def hello_world():
    return render_template('index.html', title='Home')


@app.route('/inspiration')
def insp_page():
    return render_template('inspiration.html', title='Inspiration')


@app.route('/docs')
def api_page():
    return render_template('api_docs.html', title='API Documentation')

@app.route('/loadData')
def data_loader():
    for file in os.listdir(app.config['FILES_FOLDER']):
        filename = os.fsdecode(file)
        path = os.path.join(app.config['FILES_FOLDER'], filename)
        f = open(path)
        r = csv.DictReader(f)
        d = list(r)
        for data in d:
            country = Country()
            dict = {}
            #for each key in the file
            for key in data:
                #we check if the key equals country
                if key == "country":
                    #if it does, che ceck if the country exists, if it does assign its data to our temporary variables 
                    if Country.objects(name=data[key]).count() > 0:
                        country = Country.objects.get(name=data[key])
                        dict = country.data
                    else:
                        #otherwise assign the current key as the country name
                        country.name = data[key]
                else:
                    f = filename.replace(".csv" , "")  # we want to trim off the ".csv" as we can't save anything with a "." as a mongodb field name
                    if f in dict:  # check if this filename is already a field in the dict
                        dict[f][key] = data[key]  # if it is, just add a new subfield which is key : data[key] (value)
                    else:
                        dict[f] = {key: data[key]}  # if it is not, create a new object and assign it to the dict
                # add the country data to the temp dictionary variable
                country.data = dict
            #save the country        
            country.save()
    # if everything hass gone well, Return with the message of ok and a status code of 200 
    return "OK", 200

#when the this route is callled tell mongo to drop the country collection
@app.route('/deleteTable')
def drop_DB():
    Country.drop_collection()
    return "OK", 200


#############################################################
#   Country GET API`S for both single and multi record.     #
#############################################################
#if the route is either of these and the request is a get request
@app.route('/countries', methods=['GET'])
@app.route('/countries/<count_id>', methods=['GET'])
def getCountries(count_id=None):
    # create a temp variable
    countries = {}
    # try and see if there is anthing after the /
    try:
        #if there isnt, get the whole collection of countries, if there is use the value as the country id and try and get that country
        if count_id is None:
            countries = Country.objects
        else:
            countries = Country.objects.get(id=count_id)
        return countries.to_json(), 200
    # if it fails, check if theres any thing in countries, then nothing has been found so return a 404, otherwise assume there was and internal server error and return a 500
    except:
        if not countries:
            return "NOT FOUND", 404
        else:
            return "INTERNAL SERVER ERROR", 500


######################
#   Country POST API #
######################
# if the specfied route is recieved with a POST request
@app.route('/countries/<count_name>', methods=['POST'])
def postCountries(count_name=None):
    #Check to make sure the request is being sent properly, if not return a 400
    try:
        if count_name is None:
            return "BAD REQUEST", 400
        #if it is, Stip the _ out of the string so that our names and replace them with spaces, Then save the new country to the database with an empty dictionary ready to be filled
        else:
            count_name = count_name.replace("_", " ") 
            newCountry = Country(name=count_name, data={})
            newCountry.save();
            #if everything goes ok, return a 201 to say the entry has been created
            return count_name +  " CREATED", 201
    #otherwise return a 500 for a server error
    except:
        return "INTERNAL SERVER ERROR", 500


#########################
#   Country DELETE API  #
#########################
# if the specified route is recieved with a DELETE request
@app.route('/countries/<count_id>', methods=['DELETE'])
def deleteCountry(count_id=None):

    #check to see if the request was sent empty
    try:
        if count_id is None:
            return "BAD REQUEST", 400
        else:    
            # if it wasnt, assing the var and tell mongo to delete the entry with that ID
            # If this succeeds return a 200, otherwise retun to say the entry could not be found 
            try:
                country = count_id
                Country.objects(id=country).delete()
                return "OK", 200
            except:
                return "NOT FOUND", 404
    #if for some reason there something goes wrong return a 500 for an internal server error
    except:
        return "INTERNAL SERVER ERROR", 500


#################
#   Run App.    #
################# 
if __name__ == '__main__':
    app.run()
