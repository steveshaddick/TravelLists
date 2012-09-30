# .bash_profile

# Get the aliases and functions
if [ -f ~/.bashrc ]; then
. ~/.bashrc
fi
PATH=$HOME/ruby/gems/bin:$PATH
GEM_HOME=$HOME/ruby/gems
GEM_PATH=$HOME/ruby/gems:/usr/lib/ruby/gems/1.8
export PATH GEM_HOME GEM_PATH
# END