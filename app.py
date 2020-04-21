from flask import Flask, render_template
from mongoengine import *

# connect('testDB')
#
# class User(Document):
#     email = StringField()
#     first_name = StringField()
#     last_name = StringField()
#
# class Country(Document):
#     name = StringField()
#     population = IntField()
#
# nz = Country(name='New Zealand', population=2)
# nz.save()
#
# adon = User(first_name='Adon', last_name='Moskal')
# adon.save()

app = Flask(__name__)

# set the project root directory as the static folder, you can set others.
app = Flask(__name__, static_url_path='')



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
    return "Success"

# @app.route('/users', methods=['GET'])
# @app.route('/users/<user_id>', methods=['GET'])
# def getUsers(user_id=None):
#     users = None
#     if user_id is None:
#         users = User.objects
#     else:
#         users = User.objects.get(id=user_id)
#     return users.to_json()
#
# @app.route('/countries', methods=['GET'])
# @app.route('/countries/<count_id>', methods=['GET'])
# def getCountries(count_id=None):
#     countries = None
#     if count_id is None:
#         countries = Country.objects
#     else:
#         countries = Country.objects.get(id=count_id)
#     return countries.to_json()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
