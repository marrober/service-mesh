FROM default-route-openshift-image-registry.apps.cluster-cbd4.cbd4.sandbox1842.opentlc.com/layers-01/layers-01-02:latest as input
FROM registry.redhat.io/rhel8/nodejs-14 as runtime-image
COPY --from=input /opt/app-root/src/layer.js /opt/app-root/src/layer.js
COPY --from=input /opt/app-root/src/node_modules/ /opt/app-root/src/node_modules/
USER 0
RUN chmod a+w /var/log
USER 1001
ENTRYPOINT ["node"]
CMD ["/opt/app-root/src/layer.js"]
