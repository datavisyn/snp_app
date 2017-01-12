import connexion
from flask import Blueprint

app = connexion.App(__name__, specification_dir='./')
app.add_api('swagger.yaml', base_path='/api', arguments={'title': 'SNP Api'})

static_page = Blueprint('static_page', 'static', static_folder='static', static_url_path='')

@static_page.route('/')
def root():
  return static_page.send_static_file('index.html')

app.app.register_blueprint(static_page)
