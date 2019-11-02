FROM amazon/opendistro-for-elasticsearch:1.2.0

# analysis
RUN elasticsearch-plugin install analysis-icu
RUN elasticsearch-plugin install analysis-kuromoji
RUN elasticsearch-plugin install analysis-phonetic
RUN elasticsearch-plugin install analysis-smartcn

RUN echo y | elasticsearch-plugin install repository-s3
RUN echo y | elasticsearch-plugin install discovery-ec2

ADD --chown=elasticsearch:elasticsearch ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
