if __name__ == '__main__':
  from .server import app

  app.run(host='0.0.0.0', port=9000, debug=True)
