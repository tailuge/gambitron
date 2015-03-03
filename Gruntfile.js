module.exports = function(grunt) {
    'use strict';


    grunt.initConfig({
        shell: {
            stockfish: {
                command: [
                    'rm -rf Stockfish',
                    'git clone https://github.com/official-stockfish/Stockfish.git',
                    'git checkout tags/sf_5',
                    'cd Stockfish/src',
                    'ls -lart',
                    'echo "Building stockfish"',
                    'if [ `uname -i` = x86_64 ] ; then make build ARCH=x86-64 ; else echo "not x86_64" ; make build ARCH=general-32 ; fi'
                ].join('&&')
            }
        },

        execute: {
            server: {
                src: ['src/scoreServer.js']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-execute');

};