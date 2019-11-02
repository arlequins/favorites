FROM amazon/opendistro-for-elasticsearch-kibana:1.2.0

RUN /usr/share/kibana/bin/kibana-plugin remove opendistro_security

ADD ./config /usr/share/kibana/config

# ENV ELASTICSEARCH_FULL_URL=300000
# ENV ELASTICSEARCH_REQUEST_TIMEOUT=300000
# ENV KIBANA_PORT=5601
