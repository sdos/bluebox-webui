#	Project MCM
#
#	Copyright (C) <2015-2017> Tim Waizenegger, <University of Stuttgart>
#
#	This software may be modified and distributed under the terms
#	of the MIT license.  See the LICENSE file for details.

FROM python:3.6
MAINTAINER Tim Waizenegger <tim.waizenegger@ipvs.uni-stuttgart.de>


RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

#RUN git clone https://github.com/sdos/bluebox-webui.git
ADD . bluebox-webui
WORKDIR bluebox-webui

RUN mkdir -p /etc/apt/preferences.d && mv nodesource /etc/apt/preferences.d/ && apt-get install -y nodejs yarn

RUN cp mcm/Bluebox/configuration.example.py mcm/Bluebox/configuration.py

RUN pip install -r requirements.txt
WORKDIR mcm/Bluebox/angular

# workaround for bad js package @11.04.2017
RUN yarn install; exit 0;
RUN yarn install


COPY bluebox.sh /

EXPOSE 8000

ENTRYPOINT ["/bluebox.sh"]
