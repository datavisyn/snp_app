FROM python:2.7

MAINTAINER Samuel Gratzl <samuel.gratzl@datavisyn.io>
WORKDIR /phovea

RUN apt-get update

# install dependencies last step such that everything before can be cached
COPY requirements*.txt docker_packages.txt ./
RUN (!(test -f docker_packages.txt) || (cat docker_packages.txt | xargs apt-get install -y)) && pip install --no-cache-dir -r requirements.txt

COPY ./static ./static
COPY ./snp_app ./snp_app
COPY ./data ./data
COPY ./local_cache ./local_cache

CMD python snp_app
EXPOSE 9000
