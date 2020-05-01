import csv
import os
from flask import Flask, render_template, request
from mongoengine import *

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
    population = IntField()


#########################
#   Add Data to Mongo   #
#########################
nz = Country(name='New Zealand', population=2)
nz.save()

adon = User(first_name='King', last_name='Dion')
adon.save()

############################################################################
# set the project root directory as the static folder, you can set others. #
# old = " app = Flask(__name__) "                                          #
############################################################################
app = Flask(__name__, static_url_path='')
app.config.from_object('config')


#################
#  App Routes   #
#################

@app.route('/')
@app.route('/index')
@app.route('/home')
def hello_world():
    for file in os.listdir(app.config['FILES_FOLDER']):
        filename = os.fsdecode(file)
        path = os.path.join(app.config['FILES_FOLDER'], filename)
        f = open(path)
        r = csv.reader(f)
        d = list(r)
        for data in d:
            print(data)
    return render_template('index.html', title='Home')


@app.route('/inspiration')
def insp_page():
    return render_template('inspiration.html', title='Inspiration')


@app.route('/loadData')
def data_loader():
    return "Success"


#############################################################
# User GET API`S Mainly used for testing. May remove later  #
#############################################################
@app.route('/users', methods=['GET'])
@app.route('/users/<user_id>', methods=['GET'])
def getUsers(user_id=None):
    users = None
    if user_id is None:
        users = User.objects
    else:
        users = User.objects.get(id=user_id)
    return users.to_json()


#############################################################
#   Country GET API`S for both single and multi record.     #
#############################################################
@app.route('/countries', methods=['GET'])
@app.route('/countries/<count_id>', methods=['GET'])
def getCountries(count_id=None):
    countries = None
    try:
        if count_id is None:
            countries = Country.objects
        else:
            countries = Country.objects.get(id=count_id)
        return countries.to_json(), 200
    except:
        return "Something went Wrong, Please try again", 500


#####################################################
#   Country POST api with empty placeholder method  #
#####################################################
@app.route('/countries', methods=['POST'])
def postCountries():
    try:
        nName = request.form['cName']
        nPopulation = request.form['cPop']
        newCountry = Country(name=nName, population=nPopulation)
        newCountry.save()
        return "Success!", 200
    except:
        return "Something went Wrong, Please try again", 500


#######################################################
#   Country DELETE api with empty placeholder method  #
#######################################################
@app.route('/countries', methods=['DELETE'])
def deleteCountry():

    try:
        country = request.form['name']
        print(country)
        Country.objects(name=country).delete()
        return "Success!", 200
    except:
        return "Something went Wrong, Please try again", 500


#################
#   Run App.    #
#################
if __name__ == '__main__':
    app.run()
