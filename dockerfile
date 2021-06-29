FROM default-route-openshift-image-registry.apps.cluster-0253.0253.sandbox563.opentlc.com/layers/layers-app:latest as input
FROM registry.redhat.io/rhel8/nodejs-14 as runtime-image
COPY --from=input /opt/app-root/src/layer.js /opt/app-root/src/layer.js
COPY --from=input /opt/app-root/src/node_modules/ /opt/app-root/src/node_modules/
USER 0
RUN chmod a+w /var/log
USER 1001
ENTRYPOINT ["node"]
CMD ["/opt/app-root/src/layer.js"]
