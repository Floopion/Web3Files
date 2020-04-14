from flask import Flask, render_template
from mongoengine import *

connect('testDB')

class User(Document):
    email = StringField()
    first_name = StringField()
    last_name = StringField()

adon = User(first_name='Adon', last_name='Moskal')
adon.save()

app = Flask(__name__)

# set the project root directory as the static folder, you can set others.
app = Flask(__name__, static_url_path='')


@app.route('/')
@app.route('/index')
@app.route('/home')
def hello_world():
    return render_template('index.html', title='Home' )

@app.route('/inspiration')
def insp_page():
    return render_template('inspiration.html', title='Inspiration')

@app.route('/loadData')
def data_loader():
    return "Success"

if __name__ == '__main__':
    app.run()
