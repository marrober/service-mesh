echo "Username: $1";
for i in {1..100}; do curl -H "username: $1" $GATEWAY; echo ""; done
