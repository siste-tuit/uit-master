/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			uit: {
  				green: {
  					'50': '#f0f9f4',
  					'100': '#dcf2e3',
  					'200': '#bce5cc',
  					'300': '#8dd1a8',
  					'400': '#5bb87e',
  					'500': '#1A5632',
  					'600': '#164a2a',
  					'700': '#123e22',
  					'800': '#0e321a',
  					'900': '#0a2612'
  				},
  				cream: {
  					'50': '#fefefc',
  					'100': '#fdfcf8',
  					'200': '#faf9f1',
  					'300': '#f7f6ea',
  					'400': '#f4f3e3',
  					'500': '#F5F5DC',
  					'600': '#ddddc4',
  					'700': '#c5c5ac',
  					'800': '#adad94',
  					'900': '#95957c'
  				},
  				black: {
  					'50': '#f6f6f6',
  					'100': '#e7e7e7',
  					'200': '#d1d1d1',
  					'300': '#b0b0b0',
  					'400': '#888888',
  					'500': '#6d6d6d',
  					'600': '#5d5d5d',
  					'700': '#4f4f4f',
  					'800': '#454545',
  					'900': '#3d3d3d',
  					'950': '#000000'
  				}
  			},
  			primary: {
  				'50': '#f0f9f4',
  				'100': '#dcf2e3',
  				'200': '#bce5cc',
  				'300': '#8dd1a8',
  				'400': '#5bb87e',
  				'500': '#1A5632',
  				'600': '#164a2a',
  				'700': '#123e22',
  				'800': '#0e321a',
  				'900': '#0a2612',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#fefefc',
  				'100': '#fdfcf8',
  				'200': '#faf9f1',
  				'300': '#f7f6ea',
  				'400': '#f4f3e3',
  				'500': '#F5F5DC',
  				'600': '#ddddc4',
  				'700': '#c5c5ac',
  				'800': '#adad94',
  				'900': '#95957c',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				'50': '#f6f6f6',
  				'100': '#e7e7e7',
  				'200': '#d1d1d1',
  				'300': '#b0b0b0',
  				'400': '#888888',
  				'500': '#6d6d5d',
  				'600': '#5d5d5d',
  				'700': '#4f4f4f',
  				'800': '#454545',
  				'900': '#3d3d3d',
  				'950': '#000000',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		boxShadow: {
  			uit: '0 4px 6px -1px rgba(26, 86, 50, 0.1), 0 2px 4px -1px rgba(26, 86, 50, 0.06)',
  			'uit-lg': '0 10px 15px -3px rgba(26, 86, 50, 0.1), 0 4px 6px -2px rgba(26, 86, 50, 0.05)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}