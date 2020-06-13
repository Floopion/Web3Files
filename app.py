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

#connect('devEnv')

#####################################
#   Create Tables in the database   #
#####################################
class User(Document):
    email = StringField()
    first_name = StringField()
    last_name = StringField()

class Country(Document):
    name = StringField()
    data = DictField()

#########################
#   Add Data to Mongo   #
#########################
# nz = Country(name='New Zealand', data={})
# nz.save()


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

@app.route('/')
@app.route('/index')
@app.route('/home')
def hello_world():
    return render_template('index.html', title='Home')


@app.route('/inspiration')
def insp_page():
    return render_template('inspiration.html', title='Inspiration')


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
            for key in data:
                if key == "country":
                    if Country.objects(name=data[key]).count() > 0:
                        country = Country.objects.get(name=data[key])
                        dict = country.data
                    else:
                        country.name = data[key]
                else:
                    f = filename.replace(".csv" , "")  # we want to trim off the ".csv" as we can't save anything with a "." as a mongodb field name
                    if f in dict:  # check if this filename is already a field in the dict
                        dict[f][key] = data[key]  # if it is, just add a new subfield which is key : data[key] (value)
                    else:
                        dict[f] = {key: data[key]}  # if it is not, create a new object and assign it to the dict

                country.data = dict

            country.save()
    return "success"

@app.route('/deleteTable')
def drop_DB():
    Country.drop_collection()
    return "Countries table has Been Deleted"


#############################################################
#   Country GET API`S for both single and multi record.     #
#############################################################
@app.route('/countries', methods=['GET'])
@app.route('/countries/<count_id>', methods=['GET'])
def getCountries(count_id=None):
    countries = {}
    try:
        if count_id is None:
            countries = Country.objects
        else:
            countries = Country.objects.get(id=count_id)
        return countries.to_json(), 200
    except:
        if not countries:
            console.log("404, Country not Found");
            return "NOT FOUND", 404
        else:
            console.log("500, Internal Server Error")
            return "INTERNAL SERVER ERROR", 500


######################
#   Country POST API #
######################
@app.route('/countries', methods=['POST'])
def postCountries():
    try:
        nName = request.form['cName']
        nPopulation = request.form['cPop']
        newCountry = Country(name=nName, population=nPopulation)
        newCountry.save()
        console.log("201, Entry Created")
        return "Created", 201
    except:
        console.log("500, Internal Server Error")
        return "INTERNAL SERVER ERROR", 500


#########################
#   Country DELETE API  #
#########################
@app.route('/countries', methods=['DELETE'])
def deleteCountry():

    try:
        country = request.form['name']
        print(country)
        Country.objects(name=country).delete()
        console.log("200, Entry Deleted")
        return "OK", 200
    except:
        console.log("500, Internal Server Error")
        return "INTERNAL SERVER ERROR", 500


#################
#   Run App.    #
#################
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
