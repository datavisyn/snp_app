from __future__ import print_function
import connexion
from flask import Blueprint
import os.path

app = connexion.App(__name__, specification_dir='./')
app.add_api('swagger.yaml', base_path='/api', arguments={'title': 'SNP Exploration API'})

# host static web site
static_page = Blueprint('static_page', 'static',
                        static_folder=os.path.normpath(os.path.dirname(__file__) + '/../static'), static_url_path='')


@static_page.route('/')
def root():
  return static_page.send_static_file('index.html')


app.app.register_blueprint(static_page)

#print(app.app.url_map)
